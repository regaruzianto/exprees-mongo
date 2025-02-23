const Post = require("../models/postModel");
const express = require("express");
const router = express.Router();
const middleware = require('../middleware/middleware');
const {body, param} = require('express-validator');
const User = require('../models/userModel');

// get all posts
router.get('/', async (req,res)=> {
    
    try{
        const posts = await Post.find();
        return res.json(posts);
    }
    catch(err){
        return res.status(500).json({ message : err.message});
    }  

});

// get latest post
router.get('/latest', async (req,res)=> {
    try{
        const post = await Post.find().sort({createdAt : -1}).limit(2);
        return res.json(post);
    }
    catch(err){
        return res.status(500).json({ message : err.message});
    }  
});

// create post
router.post('/', middleware.authenticateToken,
    middleware.validate([
        body('content').not().isEmpty().withMessage('Content is required').trim().escape(),
        body('image').optional().trim().escape(),
    ]),
    async (req,res) => {
    try{
        const post = new Post({
            userId : req.userId,
            content : req.body.content,
            image : req.body.image ? req.body.image : "",
        });
        await post.save();
        return res.status(201).json(post);
    }catch(err){
        return res.status(500).json({ message : err.message});
    }
});


// get posts by userId
router.get('/:userId', middleware.validate([
    param("userId").isMongoId().withMessage("invalid userId param")
]), middleware.getUser ,middleware.getTokenUser, async (req,res)=>{

    try{
        const posts = await Post.find({userId : req.params.userId});
        return res.json(posts);

    }catch(err){
        return res.status(500).json({ message : err.message});
    }
});


// get post by post id
router.get('/postId/:id', middleware.validate([
    param("id").isMongoId().withMessage("invalid id param")
]),middleware.getTokenUser, async (req,res)=>{

    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({messag : 'Post not found, Invalid postId' })
        }
        return res.json(post);

    }catch(err){
        return res.status(500).json({ message : err.message});
    }
});


//delete post 
router.delete('/deletebypostId/:id', middleware.validate([
    param("id").isMongoId().withMessage("invalid id params")
]),middleware.getTokenUser, async (req,res)=>{

    try{        
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ message : "Post not found"});
        }

        if(post.userId != req.user.id){
            return res.status(401).json({ message : "Unauthorized User"});
        }
        await post.deleteOne();
        return res.json({ message : "Post deleted"});  

    }catch(err){
        return res.status(500).json({ message : err.message});
    }
});






module.exports = router;



