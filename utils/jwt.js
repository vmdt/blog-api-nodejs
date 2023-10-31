const jwt = require('jsonwebtoken');

const genAccessToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, {expiresIn: process.env.ACCESS_EXPIRES_IN});
}

const genRefeshToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, {expiresIn: process.env.REFESH_EXPIRES_IN});
}

module.exports = {
    genAccessToken,
    genRefeshToken
}