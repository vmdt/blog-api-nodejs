const mongoose = require("mongoose");

const Notification = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
        enum: ['follow', 'like', 'comment']
    },
    content: {
        type: String,
        required: [true, 'Notification must have content']
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: undefined
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: undefined
    },
    options: {
        type: Object,
        default: {}
    }
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Notification', Notification);
