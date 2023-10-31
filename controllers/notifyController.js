const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {getAll, getOne, deleteOne, updateOne} = require('../controllers/handlerFactory');

exports.getNotisByUserId = catchAsync(async (req, res, next) => {
    const notis = await Notification.find({to: req.params.id});

    return res.status(200).json({
        status: 'success',
        data: {
            data: notis
        }
    });
});

exports.deleteNotiByUser = catchAsync(async (req, res, next) => {
    const noti = await Notification.findOneAndDelete({
        _id: req.params.id,
        to: req.user.id
    });

    if (!noti)
        return next(new AppError('Not found notification with this ID', 404));

    return res.status(200).json({
        status: 'success',
        data: null
    });
});

exports.getAllNotis = getAll(Notification);
exports.getNoti = getOne(Notification);
exports.deleteNoti = deleteOne(Notification);
exports.updateNoti = updateOne(Notification);
