const AppError = require("../utils/appError")

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return next(new AppError('You are not permission to access', 403));
        next();
    }
}

module.exports = restrictTo;
