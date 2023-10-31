const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const crypto = require('crypto');

const User = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "User Name is required"],
    },
    bio: {
        type: String,
        trim: true
    },
    profilePhoto: {
        type: Object
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
    },
    passwordConfirm: {
        type: String,
        validate: {
            validator: function(v) {
                return this.password === v;
            },
            message: 'Password confirm is not match password'
        }
    },
    typeAuth: {
        type: String,
        enum: ['google', 'local'],
        default: 'local'
    },
    googleId: {
        type: String,
        default: undefined
    },
    active: {
        type: String,
        enum: ['active', 'verify', 'ban'],
        default: 'verify'
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'user'],
        default: 'user'
    },
    followers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
    ],
    following: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    userVerifyToken: String,
    userVerifyExpires: Date
}, {
    timestamps: true,
});

User.pre('save', function(next) {
    // Only run when password was actually modified 
    if (!this.isModified('password')) return next();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;
    this.passwordConfirm = undefined;
    next();
});

User.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

User.methods.correctPassword = function(candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
}

User.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(10).toString('hex');

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

User.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const convertTimestamp = Math.round(this.passwordChangedAt.getTime() / 1000);
        return convertTimestamp > JWTTimestamp;
    }
    return false;
}

User.methods.createUserVerifyToken = function() {
    const verifyToken = crypto.randomBytes(3).toString('hex');

    this.userVerifyToken = crypto
        .createHash('sha256')
        .update(verifyToken)
        .digest('hex');

    this.userVerifyExpires = Date.now() + 5 * 60 * 1000;

    return verifyToken;
}

module.exports = mongoose.model('User', User);
