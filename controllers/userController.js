const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const BookMark = require('../models/BookMark');
const APIFeatures = require('../utils/apiFeatures');
const {getAll, createOne, deleteOne, getOne} = require('./handlerFactory');
const {cloudinary} = require('../config/cloudinary');
const {uploadSingleFile} = require('../utils/uploadFile');

exports.uploadProfilePhoto = uploadSingleFile('avatar');

exports.deleteUserPhoto = catchAsync(async (req, res, next) => {
    const user = req.user;
    const results = await cloudinary.uploader.destroy(user.profilePhoto.filename);
    if (results.result === 'not found')
        return next(new AppError('Image can not be found', 404));
    user.profilePhoto.path = process.env.DEFAULT_PROFILE_PHOTO;
    await user.save({validateBeforeSave: false});
    return res.status(200).json({
        status: 'success',
        message: 'Deleted image successfully'
    });
});

exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
    const user = req.user;
    if (!req.file)
        return next(new AppError('Upload image failed', 400));
    user.profilePhoto = {
        filename: req.file.filename,
        path: req.file.path
    };
    return res.status(200).json({
        status: 'success',
        message: 'Uploaded image successfully'
    });
});

exports.updateUserPhoto = catchAsync(async (req, res, next) => {
    const user = req.user;
    if (!req.file)
        return next(new AppError('Update image failed', 400));
    await cloudinary.uploader.destroy(user.profilePhoto.filename);
    user.profilePhoto = {
        filename: req.file.filename,
        path: req.file.path
    };
    await user.save({validateBeforeSave: false});

    return res.status(200).json({
        status: 'success',
        message: 'Updated image successfully'
    });
});


exports.followUser = catchAsync(async (req, res, next) => {
    // Check if user who following and user who followed exist
    const currentUser = req.user;
    if (!currentUser) return next(new AppError('You are not log in! Please log in to access', 401));

    
    const userToFollow = await User.findById(req.body.id);
    if (!userToFollow) 
        return next(new AppError('Can not find user to follow with that ID', 404));
    if (currentUser.id === userToFollow.id)
        return next(new AppError('You can not follow yourself', 400));

    const index = currentUser.following.findIndex(item => item.toString() === userToFollow.id.toString());
    if (index !== -1) return next(new AppError('You already followed this user', 400));

    // update following and follower
    await currentUser.updateOne({$push: {following: userToFollow.id}});
    await userToFollow.updateOne({$push: {followers: currentUser.id}});

    // push notify to sys noti
    await Notification.create({
        user: currentUser.id,
        to: userToFollow.id,
        type: 'follow',
        content: '@@@ followed @@@@',
        options: {
            from_username: currentUser.username,
            to_username: userToFollow.username
        }
    });

    return res.status(200).json({
        status: 'success',
        message: 'Following user is successfull'
    });
});

exports.unFollowUser = catchAsync(async (req, res, next) => {
    // Check if user who unfollowing and user who unfollowed exists
    const currentUser = req.user;
    if (!currentUser)
        return next(new AppError('You are not log in! Please log in to access', 401));
    const userToUnfollow = await User.findById(req.body.id);
    if (!userToUnfollow) 
        return next(new AppError('Can not find user to unfollow with that ID', 404));

    if (currentUser.id === userToUnfollow.id)
        return next(new AppError('You can not unfollow yourself', 400));

    const index = currentUser.following.findIndex(item => item.toString() === userToUnfollow.id.toString());
    if (index === -1)
        return next(new AppError('You have not followed this user yet', 400));

    // update following and followers
    await currentUser.updateOne({$pull: {following: userToUnfollow.id}});
    await userToUnfollow.updateOne({$pull: {followers: currentUser.id}});

    // remove notify from sys noti
    await Notification.findOneAndDelete({
        type: 'follow',
        user: currentUser.id,
        to: userToUnfollow.id
    });

    return res.status(200).json({
        status: 'success',
        message: 'Unfollowing user is successfull'
    });
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key))
            newObj[key] = obj[key]; 
    });
    return newObj;
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // Send error if user posts email or password
    if (req.body.password || req.body.passwordConfirm)
        return next(new AppError('This route is not for password updates', 400));

    // filtered out unwant fields update
    let updateObj = {...req.body};
    updateObj = filterObj(updateObj, 'username', 'bio');

    if (req.file) updateObj.profilePhoto = {
        filename: req.file.filename,
        path: req.file.path
    };

    const user = await User.findByIdAndUpdate(req.user.id, updateObj, {
        new: true,
        runValidators: true
    });

    user.password = undefined;

    res.status(200).json({
        status: 'success',
        data: {
            data: user
        }
    });
});

exports.actionUser = catchAsync(async (req, res, next) => {
    const action = req.body.action;

    const user = await User.findOneAndUpdate(
        {_id: req.body.user}, 
        {active: action},
        {
            new: true,
            runValidators: true,
        }
    );

    if (!user)
        return next(new AppError('Not found this user', 404));

    if (action === 'ban') {
        // hide records belong to user
        await Comment.updateMany({user: req.body.user}, {
            isHidden: true
        });
        
        await Post.updateMany({user: req.body.user}, {
            isHidden: true
        });

        await BookMark.updateMany({user: req.body.user}, {
            isHidden: true
        });
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            data: user
        }
    });
});

const searchHashtag = async (query) => {
    const queryField = new RegExp('^' + query);
    const result = await Post.find({ hashtag: { $in: [queryField] } });
    return result;
  };

exports.search = catchAsync(async (req, res, next) => {
    if (req.query.search.startsWith('#')) {
        const hashtags = await searchHashtag(req.query.search.slice(1));

        return res.status(200).json({
            status: 'success',
            data: {
                results: hashtags.length,
                data: hashtags
            }
        });
    }

    const queryField = new RegExp('^' + req.query.search);

    const users = await User.find({
      username: { $regex: queryField },
    }).select('-password');
  
    res.status(200).json({
      status: 'success',
      data: {
        results: users.length,
        data: users
      }
    });
});

exports.getUserById = getOne(User);
exports.createUser = createOne(User);
exports.getAllUsers = getAll(User);
exports.deleteUser = deleteOne(User);
 