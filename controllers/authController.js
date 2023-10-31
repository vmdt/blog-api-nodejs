const User = require('../models/User');
const RefeshToken = require('../models/RefeshToken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {genAccessToken, genRefeshToken} = require('../utils/jwt');
const sendMail = require('../utils/sendMail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const createSendToken = async (user, statusCode, res) => {
    // Generate Access Token
    const accessToken = genAccessToken({id: user._id});

    // Generate refesh token and store it in db
    await RefeshToken.findOneAndDelete({user: user.id});
    const refeshTokenDoc = await RefeshToken.create({user: user.id});
    const refeshToken = genRefeshToken({ user: refeshTokenDoc.user, tokenId: refeshTokenDoc.id });

    // Store refeshToken in cookie
    res.cookie('refeshToken', refeshToken, {httpOnly: true, maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000});

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        data: {
            user,
            accessToken,
            refeshToken
        }
    });
}


exports.loginGoogle = catchAsync(async (req, res, next) => {
    if (req.isAuthenticated()) {
        createSendToken(req.user, 200, res);
    } else {
        res.status(401).json({
            status: 'fail',
            message: 'Unauthenticated!'
        });
    }
});

exports.sendVerifyMail = catchAsync(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if (!user)
        return next(new AppError('No user found with that email', 404));

    const verifyToken = user.createUserVerifyToken();
    await user.save({validateBeforeSave: false});

    const verifyURL = `${req.protocol}://${req.headers.host}/api/v1/users/verify`;
    const text = `Are you account owner? 
    Please confirm your account at: ${verifyURL}
    Your OTP code: ${verifyToken}
    If not, please ignore this email!`;
    
    try {
        await sendMail({
            to: user.email,
            subject: 'Verify User (valid for only 5 minutes)',
            text
        });

        return res.status(200).json({
            status: 'success',
            message: 'User verify token sent to email'
        });
    } catch (error) {
        user.userVerifyToken = undefined;
        await user.save({validateBeforeSave: false});

        return res.status(500).json({
            status: 'error',
            message: 'There was an error sending email'
        });
    }

});

exports.verifyUser = catchAsync(async (req, res, next) => {
    const hashedCode = crypto
        .createHash('sha256')
        .update(req.body.otp)
        .digest('hex');
    
    const user = await User.findOne({
        userVerifyToken: hashedCode,
        userVerifyExpires: {$gt: Date.now()}
    });

    if (!user)
        return next(new AppError('OTP code was incorrect or has expired! Please try again', 400));

    user.active = 'active';
    user.userVerifyToken = undefined;
    user.userVerifyExpires = undefined;
    await user.save({validateBeforeSave: false});

    createSendToken(user, 200, res);
});

exports.register = catchAsync(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if (user) return next(new AppError('Email already existed', 400));

    const newUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    return res.status(200).json({
        status: 'success',
        message: 'Signup is successful, Please verify account to access!'
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    // Check if email and password exist
    if (!email || !password) return next(new AppError('Please provide email or password', 400));

    // Check email and password
    let user = await User.findOne({email});
    if (!user || !user.correctPassword(password))
        return next(new AppError('Incorrect email or password', 401));

    // Check if user was banned
    if (user.active === 'ban') {
        res.cookie('refeshToken', 'loggedout', {
            expires: Date.now() + 10*1000,
            httpOnly: true
        });
        return next(new AppError('You were banned!', 403));
    }

    // Check if user must be verify account
    if (user.active === 'verify') 
        return next(new AppError('Your account has not been activated! Please verify account to access', 401));

    createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie('refeshToken');
    return res.status(200).json({
        status: 'success'
    });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // Get user based on Posted email
    const user = await User.findOne({email: req.body.email});
    if (!user) return next(new AppError('There is no user with email address', 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    // URL for reset password
    const url = `${req.protocol}://${req.headers.host}/api/v1/users/reset-password/${resetToken}`;
    const text = 
    `You forgot the password? Access to the link and reset your password:
    ${url}`;
    try {
        await sendMail({
            to: user.email,
            subject: 'Forgot password? Your password reset token is valid for only 10 minutes',
            text
        });
        return res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError('There was an error sending the email', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // Hash password reset token and find user
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });

    if (!user) return next(new AppError('Token is invalid or has expired', 400));
    
    // update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: true});

    createSendToken(user, 200, res);
});

exports.validateRefeshToken = catchAsync(async (req, res, next) => {
    const refeshToken = req.cookies.refeshToken;
    if (!refeshToken) return next(new AppError('Missing Refesh Token', 401));
    const decoded = jwt.verify(refeshToken, process.env.JWT_SECRET);
    // Find refesh token stored in db
    const tokenExists = RefeshToken.findById(decoded.tokenId);
    if (!tokenExists) return next(new AppError('Refesh Token is invalid', 401));
    req.refeshToken = decoded;
    next();
});

exports.refeshAccessToken = catchAsync(async (req, res, next) => {
    const refeshToken = req.refeshToken;
    // Restore new refesh token
    const refeshTokenDoc = await RefeshToken.create({user: refeshToken.user});
    await RefeshToken.deleteOne({_id: refeshToken.id});
    // Generate new refesh token and new access token
    const newRefeshToken = genRefeshToken({user: refeshTokenDoc.user, tokenId: refeshTokenDoc.id});
    const newAccessToken = genAccessToken({id: refeshToken.user});

    res.cookie('refeshToken', newRefeshToken, {
        httpOnly: true, 
        maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        status: 'success',
        data: {
            accessToken: newAccessToken,
            refeshToken: newRefeshToken
        }
    });
});
