const Post = require("../models/postModel");
const express = require("express");
const router = express.Router();
const middleware = require('../middleware/middleware');
const {body, param, query} = require('express-validator');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const Like = require('../models/likeModel');

// get all posts
router.get('/',middleware.validate([
    query('page').optional().isInt({ min : 1}).withMessage('page must be positive number'),
    query('limit').optional().isInt({ min: 1}).withMessage('page must be positive number')
]), async (req,res)=> {
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    try{
        const posts = await Post.find().skip(skip).limit(limit);
        const totalDocuments = await Post.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);

        return res.status(200).json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : posts,
            pagination : {
                currentPage : page,
                totalPages : totalPages,
                totalDocuments : totalDocuments,
                perPage : limit,
            }
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
            userId : req.user.id,
            content : req.body.content,
            image : req.body.image ? req.body.image : "",
        });
        await post.save();
        return res.status(201).json({
            status : 'success',
            message : 'Post created successfully',
            data : post
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            status : 'error',
            message : 'Internal server error'
        });
    }
});


// get posts by userId
router.get('/:userId', middleware.validate([
    param("userId").isMongoId().withMessage("invalid userId param")
]), middleware.getUser ,middleware.authenticateToken, async (req,res)=>{

    try{
        const posts = await Post.find({userId : req.params.userId});
        return res.json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : posts
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            status :   'error',
            message : 'Internal server error'
        });
    }
});


// get post by post id
router.get('/postId/:id', middleware.validate([
    param("id").isMongoId().withMessage("invalid id param")
]),middleware.authenticateToken, async (req,res)=>{

    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                status : 'error',
                message : 'Post not found, Invalid postId' })
        }
        return res.json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : post
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message : 'Internal server error'
        });
    }
});


//delete post 
router.delete('/deletebypostId/:id', middleware.validate([
    param("id").isMongoId().withMessage("invalid id params")
]),middleware.authenticateToken, async (req,res)=>{

    try{        
        const post = await Post.findById(req.params.id);
        
        if(!post){
            return res.status(404).json({ 
                status : 'error',
                message : "Post not found"
            });
        }

        
        if(post.userId != req.user.id){
            return res.status(401).json({ 
                status : 'error',
                message : "Unauthorized User"
            });
        }


        await Comment.deleteMany({postId : post.id});
        await Like.deleteMany({ postId : post.id});

        await post.deleteOne();
        return res.json({ 
            status : 'success',
            message : "Post deleted successfully"
        });  

    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message : 'Internal server error'
        });
    }
});




module.exports = router;



