const mongoose = require('mongoose');

const likeSchema = mongoose.Schema({
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
    createdAt : {
        type : Date,
        default : Date.now,
        
    }
});


module.exports = mongoose.model( "Like", likeSchema);