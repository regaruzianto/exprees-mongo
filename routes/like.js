const express = require('express');
const router = express.Router();
const Like = require('../models/likeModel');
const middleware = require('../middleware/middleware');
const {body, param} = require('express-validator');
const Post = require('../models/postModel');

// get all likes
router.get('/', async (req,res)=> {
    
    try{
        const likes = await Like.find().lean();

        return res.json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : likes
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message : 'Internal server error'
        });
    }  

});

//get like by post id
router.get('/postId/:id', middleware.validate([
    param("id").isMongoId().withMessage("invalid id param")
]),middleware.authenticateToken, async (req,res)=>{

    try{
        const likes = await Like.find({postId : req.params.id}).sort({createdAt : -1}).populate('userId', "name profilePic _id ").lean();
        return res.status(200).json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : likes
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message : 'Internal server error'
        });
    };
});


//get like by user id
router.get('/userId/:id',middleware.validate([
    param("id").isMongoId().withMessage("invalid id param")
]), middleware.authenticateToken, async (req,res)=>{

    try{
        const likes = await Like.find({userId : req.params.id}).sort({createdAt : -1}).populate('userId', "name profilePic _id ").lean();
        return res.json({
            status : 'error',
            message : 'Data successfully retrieved',
            data : likes
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message : 'Internal server error'
        });
    };
});


//Like post by post id
router.post('/likepost/:postId', middleware.validate([
    param('postId').isMongoId().withMessage("invalid post id")
]), middleware.authenticateToken, async (req,res) => {

    const post = await Post.findById(req.params.postId);
    const liked = await Like.findOne({postId : req.params.postId,  userId : req.user.id});

    if(!post){
        return res.status(404).json({
            status : "error",
            message : "Post not find"});
    };

    if(liked){
        return res.status(400).json({
            status : 'error',
            message : "Post already liked"
        });
    };

    try{
        const like = new Like({
            postId : req.params.postId,
            userId : req.user.id
        });
        await post.updateOne({ $inc : {likesCount : 1}});
        await like.save();
        return res.status(201).json({ 
            status : 'success',
            message : "Post liked successfully",
            data : like
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            status : 'error',
            message : 'Internal server error'
        });
    };
});


//UnLike post by post id
router.delete('/unlikepost/:postId', middleware.validate([
    param('postId').isMongoId().withMessage('Invalid postId')
]), middleware.authenticateToken, async (req,res) => {

    try{
        const like = await Like.findOne({ postId: req.params.postId, userId : req.user.id});
        const post = await Post.findById(req.params.postId);

        if(!like){
            return res.status(404).json({ 
                status : 'error',
                message : "liked post or user not find"
            });
        }

        await post.updateOne({ $inc : {likesCount : -1}});
        await like.deleteOne();
        return res.status(200).json({
            status : 'success',
            message : "Post unlike successfully"
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message : 'Internal server error'
        });
    };
    
});


module.exports = router;
