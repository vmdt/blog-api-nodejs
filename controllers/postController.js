const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const {getAll, getOne} = require('../controllers/handlerFactory');
const { uploadMultipleFiles } = require('../utils/uploadFile');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {cloudinary} = require('../config/cloudinary');

const deleteImageCloudinary = async (id) => {
    const results = await cloudinary.uploader.destroy(id);
    if (results.result === 'not found')
        return false;
    return true;
}

exports.uploadImages = uploadMultipleFiles('images');

exports.likePost = catchAsync(async (req, res, next) => {
    const post = await Post.findOne({
        _id: req.params.id,
        isHidden: false
    }).populate('user', 'username profilePhoto');

    if (!post)
        return next(new AppError('Not found post with this Id', 404));

    const index = post.likes.indexOf(req.user.id);

    if (index !== -1) {
        post.likes.splice(index, 1);
        
        // delete notify from sys noti
        await Notification.findOneAndDelete({
            type: 'like',
            user: req.user.id,
            to: post.user,
            post: post.id
        });

    } else {
        post.likes.push(req.user.id);

        // push notify to sys noti
        await Notification.create({
            user: req.user.id,
            to: post.user,
            type: 'like',
            content: '@@@ liked post @@@@',
            post: post.id,
            options: {
                from_username: req.user.username,
                to_username: post.user.username
            }
        });
    }

    await post.save();

    return res.status(200).json({
        status: 'success',
        data: {
            data: post
        }
    });
});

exports.createPost = catchAsync(async (req, res, next) => {
    const images = [];
    if (req.files) {
        for (const file of req.files) {
            images.push({
                filename: file.filename,
                path: file.path
            });
        }
    }

    const post = await Post.create({
        caption: req.body.caption,
        user: req.user.id,
        images
    });

    return res.status(201).json({
        status: 'success',
        data: {
            data: post
        }
    });
});

exports.updatePost = catchAsync(async (req, res, next) => {
    let updateObj = {...req.body};

    if (req.files) {
        updateObj.images = [];
        for (const file of req.files) {
            updateObj.images.push({
                filename: file.filename,
                path: file.path
            });
        }
    }

    const post = await Post.findOneAndUpdate(
        {
            _id: req.params.id,
            isHidden: false
        }, updateObj, {
            new: true,
            runValidators: true
    });
    // run save hook to extract new hashtag
    await post.save();
    if (!post)
        return next(new AppError('Not found post with this Id', 404));

    res.status(200).json({
        status: 'success',
        data: {
            data: post
        }
    });

});

exports.deletePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post)
        return next(new AppError('Not found post with that Id', 404));

    if (post.user.toString() !== req.user.id.toString())
        return next(new AppError('You are not authorized to delete this post', 403));

    post.images.forEach(async (image) => {
        if (!(await deleteImageCloudinary(image.filename)))
            return next(new AppError('Image or video can not be found', 404));
    });

    // delete comment belongs to this post
    await Comment.deleteMany({post: post.id});

    // delete like, comment noti from sys noti
    await Notification.deleteMany({
        type: {
            $in: ['like', 'comment']
        },
        post: post.id
    });
    // delete post
    await Post.findByIdAndDelete(post.id);
    
    return res.status(200).json({
        status: 'success',
        data: null
    });
});


exports.getPostById = getOne(Post, [
    {
        path: 'user',
        select: 'username profilePhoto'
    },
    {
        path: 'comment',
        select: 'user comment',
        populate: {
            path: 'user',
            select: 'username profilePhoto'
        }
    }
], {isHidden: false});

exports.getAllPosts = getAll(Post, {path: 'comment', select: 'comment'});