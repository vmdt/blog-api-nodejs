const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const Group = require('../models/Group');
const Message = require('../models/Message');
const {getOne, updateOne, deleteOne} = require('./handlerFactory');

exports.createGroup = catchAsync(async (req, res, next) => {
    const users = req.body.users;

    if (!users)
        return next(new AppError('Please select user', 400));

    const group = await Group.findOne({
        users: { $all: [req.user.id, ...users]},
        createdBy: req.user.id
    });

    if (group)
        return next(new AppError('Group already exist', 400));

    

    const createdGroup = await Group.create({
        createdBy: req.user.id,
        users: [req.user.id, ...users],
        groupType: req.body.groupType
    });

    const newGroup = await createdGroup
     .populate({
        path: 'users',
        select: 'username profilePhoto'
     });

    return res.status(201).json({
        status: 'success',
        data: {
            data: newGroup
        }
    });
});

exports.updateGroupByUser = catchAsync(async (req, res, next) => {
    const group = await Group.findOneAndUpdate({
        _id: req.params.id,
        createdBy: req.user.id
    }, {
        users: req.body.users,
        groupType: req.body.type
    }, {new: true});

    if (!group)
        return next(new AppError('Not found group', 404));

    return res.status(200).json({
        status: 'success',
        data: {
            data: group
        }
    });
});

exports.getUserGroups = catchAsync(async (req, res, next) => {
    const groups = await Group.find({
        users: {$in: [req.user.id]}
    });

    return res.status(200).json({
        status: 'success',
        data: {
            results: groups.length,
            data: groups
        }
    });
});


exports.createMessage = catchAsync(async (req, res, next) => {
    const {message} = req.body;

    if (!message)
        return next(new AppError('Message should not empty', 400));

    const createdMessage = await Message.create({
        message,
        groupId: req.params.id,
        sender: req.user.id,
    });

    await createdMessage.populate({
        path: 'sender',
        select: 'username profilePhoto'
    });

    return res.status(200).json({
        status: 'success',
        data: {
            data: createdMessage
        }
    });
});


exports.getGroupMessage = catchAsync(async (req, res, next) => {
    const group = await Group.findOne({
        _id: req.params.id,
        users: {$in: [req.user.id]}
    });

    if (!group)
        return next(new AppError('Not found group chat', 404));

    const messages = await Message.find({
        groupId: group._id
    }).populate([
        {
            path: 'sender',
            select: 'username profilePhoto'
        },
        {
            path: 'seen',
            select: 'username profilePhoto'
        }
    ]);

    return res.status(200).json({
        status: 'success',
        data: {
            data: messages
        }
    });
});

exports.setSeenMessage = catchAsync(async (req, res ,next) => {
    const seen = await Message.updateMany({
        groupId: req.params.id,
        sender: {$ne: req.user.id},
        seen: {$nin: req.user.id}
    }, {
        $push: {seen: req.user.id}
    }, {
        new: true
    });

    return res.status(200).json({
        status: 'success',
        message: 'You seen messages'
    })
});

exports.getGroupByUser = catchAsync(async (req, res, next) => {
    const group = await Group.findOne({
        users: {$in: [req.user.id]},
        _id: req.params.id
    }).populate({
        path: 'messages',
        select: 'message sender',
        populate: {
            path: 'sender',
            select: 'username profilePhoto'
        }
    });

    if (!group)
        return next(new AppError('Not found group', 404));

    return res.status(200).json({
        status: 'success',
        data: {
            data: group
        }
    });
});
