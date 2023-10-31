const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const {getAll, getOne, deleteOne, updateOne, createOne} = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.likeComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findOne({
        _id: req.params.id,
        isHidden: false
    }).populate('user', 'username profilePhoto');

    if (!comment) 
        return next(new AppError('Not found comment with this ID', 404));

    const index = comment.likes.indexOf(req.user.id);
    if (index !== -1) {
        comment.likes.splice(index, 1);

        await Notification.findOneAndDelete({
            user: req.user.id,
            to: comment.user,
            type: 'like',
            post: comment.post,
            comment: comment.id
        });
    } else {
        comment.likes.push(req.user.id);

        if (req.user.id.toString() !== comment.user.id.toString())
            // push like comment notify into sys noti
            await Notification.create({
                user: req.user.id,
                to: comment.user.id,
                type: 'like',
                post: comment.post,
                comment: comment.id,
                content: "@@@ liked comment @@@@",
                options: {
                    from_username: req.user.username,
                    to_username: comment.user.username
                }
            });
    }

    await comment.save();

    return res.status(200).json({
        status: 'success',
        data: {
            data: comment
        }
    });
});

exports.updateMyComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findOneAndUpdate({
        _id: req.params.id,
        user: req.user.id,
        isHidden: false
    }, req.body, {new: true});

    if (!comment)
        return next(new AppError('Not found comment with this ID', 404));

    return res.status(200).json({
        status: 'success',
        data: {
            data: comment
        }
    });
});

exports.createComment = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.body.post).populate('user', 'username profilePhoto');

    if (!post)
        return next(new AppError('Not found post', 404));
    
    const parent = await Comment.findById(req.body.parent).populate('user', 'username profilePhoto');

    const comment = await Comment.create({
        user: req.user.id,
        ...req.body
    });

    // add comment to parent comment
    if (parent) {
        parent.reply.push(comment.id);
        await parent.save();

        if (req.user.id.toString() !== parent.user.id.toString()) {
            // push notify comment to comment into sys noti
            await Notification.create({
                user: req.user.id,
                to: parent.user,
                type: 'comment',
                content: '@@@ commented to comment @@@@',
                comment: comment.id,
                post: post.id,
                options: {
                    from_username: req.user.username,
                    to_username: parent.user.username
                }
            });
        }
    }

    if (req.user.id.toString() !== post.user.id.toString()
        &&
        !(await Notification.exists({
            user: req.user.id,
            to: post.user,
            post: post.id
        }))) {
        // push notify comment to post into sys noti
        await Notification.create({
            user: req.user.id,
            to: post.user,
            type: 'comment',
            content: '@@@ commented post @@@@',
            post: post.id,
            comment: comment.id,
            options: {
                from_username: req.user.username,
                to_username: post.user.username
            }
        });
    }

    return res.status(201).json({
        status: 'success',
        data: {
            data: comment
        }
    });
});

exports.deleteMyComment = catchAsync(async (req, res, next) => {

    const comment = await Comment.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
    });

    if (!comment)
        return next(new AppError('Not found comment with this ID', 404));

    await Comment.deleteMany({parent: comment.id});

    // remove all reply comment notis and comment noti from sys noti
    comment.reply.forEach(async cm => {
        await Notification.deleteMany({
            type: {
                $in: ['like', 'comment']
            },
            comment: cm
        });
    });

    
    await Notification.deleteMany({
        type: {
            $in: ['like', 'comment']
        },
        comment: comment.id
    });

    return res.status(200).json({
        status: 'success',
        data: null
    });
});

exports.getAllComments = getAll(Comment);
exports.updateComment = updateOne(Comment);
exports.deleteComment = deleteOne(Comment);