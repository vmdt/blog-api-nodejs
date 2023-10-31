const mongoose = require("mongoose");

const RefeshToken = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

RefeshToken.index(
  { createdAt: 1 },
  { expireAfterSeconds: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 }
);
const RefreshToken = mongoose.model("RefreshToken", RefeshToken);

module.exports = RefreshToken;
