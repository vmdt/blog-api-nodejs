const mongoose = require("mongoose");

const BookMark = new mongoose.Schema({
    name: {
        type: String,
        default: 'My Collection'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    post: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    isHidden: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
});

module.exports = mongoose.model('BookMark', BookMark);
