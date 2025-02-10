const mongoose = require('mongoose');
const User = require('./userModel');

const postSchema = new mongoose.Schema({
    userId :{
        type : mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required : true,
    },
    content : {
        type : String,
        required : true,
    },
    image : {
        type : String,
    },
    likesCount : {
        type : Number,
        default : 0,
    },
    commentsCount : {
        type : Number,
        default : 0,
    },
    createdAt : {
        type : Date,                                                                                                                                                                                                                                                                                                       
        default : Date.now,
    }


});

postSchema.index({ userId :1});
postSchema.index({ createdAt : 1});

module.exports = mongoose.model("Post", postSchema);