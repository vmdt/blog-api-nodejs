const mongoose = require('mongoose');

const Post = new mongoose.Schema({
    caption: {
        type: String,
        required: [true, "Post caption is required"],
        trim: true,
    },
    hashtag: Array,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please Author is required"],
    },
    images: Array,
    isHidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

Post.virtual('comment', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});

// extract hashtag
Post.pre('save', function(next) {
    // clear hashtag
    this.hashtag = [];
    const caption = this.caption;
    const matches = caption.match(/#(\w+)/g);
    if (!matches) {
        this.hashtag = undefined;
        next();
    }
    matches.forEach(match => {
        this.hashtag.push(match.slice(1));
    });

    next();
});

module.exports = mongoose.model('Post', Post);
