const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const getAll = (Model, popOptions, filterOpts) => {
    return catchAsync(async (req, res, next) => {
        const features = new APIFeatures(Model.find().populate(popOptions), req.query)
         .filter()
         .sort()
         .limitFields()
         .paginate();

        if (filterOpts) {
            if (filterOpts.byUser) filterOpts.user = req.user.id;
            delete filterOpts.byUser;
            features.query.where(filterOpts);
        }
        const doc = await features.query;
        return res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });
}

const createOne = Model => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
        return res.status(201).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });
}

const deleteOne = Model => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return next(new AppError('No document found with that ID', 404));
        return res.status(204).json({
            status: 'success',
            data: null
        });
    });
}

const updateOne = Model => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidator: true
        });

        if (!doc) return next(new AppError('No document found with that ID', 404));

        return res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        })
    });
}

const getOne = (Model, popOptions, filterOpts) => {
    return catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (filterOpts) {
            if (filterOpts.byUser) filterOpts.user = req.user.id;
            delete filterOpts.byUser;
            query.where(filterOpts);
        }
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) return next(new AppError('No document found with that ID', 404));
        
        return res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });
}

module.exports = {
    getAll,
    getOne,
    createOne,
    deleteOne,
    updateOne,
    createOne
}