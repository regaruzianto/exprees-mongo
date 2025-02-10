const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
    },
    email : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
        unique : true,
    },
    password : {
        type : String,
        required: true,
        minlength: 6,
    },
    createdAt : {
        type : Date,
        default : Date.now,

    },
    profilePic :{
        type : String,
        default : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    bio : {
        type : String,
        default : "bio",
    },
    followersCount : {
        type : Number,
        default : 0,
        min : 0,
    },
    followingCount : {
        type: Number,
        default : 0,
        min : 0,
    }
});

module.exports = mongoose.model('User', userSchema);