const BookMark = require('../models/BookMark');
const {getAll, getOne, createOne, deleteOne, updateOne} = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Post = require('../models/Post');

exports.createBookmark = catchAsync(async (req, res, next) => {
    const bookmark = await BookMark.create({
        user: req.user.id,
        ...req.body
    });

    return res.status(201).json({
        status: 'success',
        data: {
            data: bookmark
        }
    });
});

exports.saveToBookmark = catchAsync(async (req, res, next) => {
    const bookmark = await BookMark.findOne({
        _id: req.params.id,
        isHidden: false
    });

    if (!bookmark)
        return next(new AppError('Not found Bookmark with this ID', 404));

    const post = await Post.findOne({
        _id: req.body.post,
        isHidden: false
    });

    if (!post)
        return next(new AppError('Not found post with this ID', 404));

    bookmark.post.push(post.id);
    await bookmark.save();
    await bookmark.populate('post');

    return res.status(200).json({
        status: 'success',
        data: {
            data: bookmark
        }
    });
});

exports.deleteBookmarkByUser = catchAsync(async (req, res, next) => {
    const bookmark = await BookMark.findById(req.params.id);
    if (!bookmark)
        return next(new AppError('Not found Bookmark with this ID', 404));

    if (req.user.id.toString() !== bookmark.user.toString())
        return next(new AppError('You are not permission', 403));


    await BookMark.deleteOne({_id: bookmark.id});

    return res.status(200).json({
        status: 'success',
        data: null
    });
});

exports.removePostFromBookmark = catchAsync(async (req, res, next) => {
    const bookmark = await BookMark.findOne({
        _id: req.params.id,
        isHidden: false
    });
    
    if (!bookmark)
        return next(new AppError('Not found Bookmark with this ID', 404));

    const index = bookmark.post.indexOf(req.body.post);

    if (index === -1)
        return next(new AppError('Not found Post in Bookmark', 404));

    bookmark.post.splice(index, 1);
    await bookmark.save();

    return res.status(200).json({
        status: 'success',
        data: {
            data: bookmark
        }
    });
});

exports.getBookmark = getOne(BookMark, {
    path: 'post', 
    match: {
        isHidden: false
    }}, {byUser: true});

exports.getBookmarks = getAll(BookMark, {
    path: 'post', 
    match: {
        isHidden: false
    }}, {byUser: true});