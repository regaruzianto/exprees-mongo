const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    postId : {
        type : mongoose.Schema.ObjectId, 
        ref : "Post",
        require : true,
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        require : true,
    },
    comment : {
        type : String,
        require : true,
    },
    createAt : {
        type : Date,
        default : Date.now,
    }
});

commentSchema.index({ postId : 1});

module.exports = mongoose.model("Comment", commentSchema);