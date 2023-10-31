const mongoose = require('mongoose');

const Group = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    groupType: {
        type: String,
        required: [true, 'Group type is required'],
        enum: ['private', 'public'],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

Group.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'groupId'
});

Group.pre(/^find/, function (next) {
    this.find().populate({
        path: 'users',
        select: 'username profilePhoto',
    });
    next();
});

module.exports = mongoose.model('Group', Group);