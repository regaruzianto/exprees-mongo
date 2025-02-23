const mongoose = require('mongoose');
const Follow = require('./followModel');
const Post = require('./postModel');
const Comment = require('./commentModel');
const Like = require('./likeModel');

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


//pre middleware hapus semua data user(follow,post) ketika user dihapus
userSchema.pre("findOneAndDelete", async function(next){

    const user = await this.model.findOne(this.getQuery());
    
    
    if(user){
        //delete follow connection 
        await Follow.deleteMany({ 
            $or : [{ followingId : user._id}, {followerId : user._id}]
        });

        //delete comments and likes of user's post
        const posts = await Post.find({userId : user._id});
        for(const post of posts){
            await Like.deleteMany({ postId : post._id });
            await Comment.deleteMany({ postId : post._id });
        }

        //delete user's post
        await Post.deleteMany({userId : user._id});

        //delete user's comments
        await Comment.deleteMany({userId : user._id});

        //delete user's likes
        await Like.deleteMany({ userId : user._id});

        
    }
    next();

});


module.exports = mongoose.model('User', userSchema);