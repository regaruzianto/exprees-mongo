const express = require('express');
const router = express.Router();
const Like = require('../models/likeModel');
const middleware = require('../middleware/middleware');
const {body, param} = require('express-validator');
const Post = require('../models/postModel');

// get all likes
router.get('/', async (req,res)=> {
    
    try{
        const likes = await Like.find();
        return res.json(likes);
    }
    catch(err){
        return res.status(500).json({ message : err.message});
    }  

});

//get like by post id
router.get('/postId/:id', middleware.validate([
    param("id").isMongoId().withMessage("invalid id param")
]),middleware.getTokenUser, async (req,res)=>{

    try{
        const like = await Like.find({postId : req.params.id}).sort({createdAt : -1});
        return res.json(like);

    }catch(err){
        return res.status(500).json({ message : err.message});
    }
});


//get like by user id
router.get('/userId/:id', middleware.validate([
    param("id").isMongoId().withMessage("invalid id param")
]),middleware.getTokenUser, async (req,res)=>{

    try{
        const like = await Like.find({userId : req.params.id}).sort({createdAt : -1});
        return res.json(like);

    }catch(err){
        return res.status(500).json({ message : err.message});
    }
});


//Like post by post id
router.post('/likepost/:postId', middleware.validate([
    param('postId').isMongoId().withMessage("invalid post id")
]), middleware.getTokenUser, async (req,res) => {
    const post = await Post.findById(req.params.postId);
    const liked = await Like.find({postId : req.params.postId}, { userId : req.user.id});
    if(!post){
        return res.status(404).json({message : "Post not find"});
    };
    if(liked){
        return res.status(400).json({message : "user already liked post"})
    }
    try{
        const like = new Like({
            postId : req.params.postId,
            userId : req.user.id
        });
        post.updateOne({ likesCount : likesCount +1});
        await like.save();
        return res.status(201).json({ message : "Post liked"});
    }catch(err){
        return res.status(500).json({message : err.message});
    }
});


//UnLike post by post id
router.delete('/unlikepost/:postId', middleware.validate([
    param('postId').isMongoId().withMessage('Invalid postId')
]), middleware.getTokenUser, async (req,res) => {

    try{
        const like = Like.find({ postId: req.params.postId, userId : req.user.id});
        if(!like){
            return res.status(404).json({ message : "liked post or user not find"});
        }
        await like.deleteOne();
        return res.status(200).json({message : "Post unlike successfully"});

    }catch(err){
        return res.status(500).json({ message : err.message});
    }
    
});


module.exports = router;
