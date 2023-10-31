const mongoose = require('mongoose');

const Message = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    message: {
        type: String,
        required: [true, 'Message should not be empty'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    seen: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
});

module.exports = mongoose.model('Message', Message);