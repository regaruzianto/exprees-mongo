const Comment = require('../models/commentModel');
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/middleware');
const {body, param } = require('express-validator');
const User = require("../models/userModel");



//get all comment 
router.get('/', async (req,res) => {
    try{
        const comments = await Comment.find().lean();
        return res.status(200).json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : comments });
    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message : 'Internal server error'
        });
    }
    
});


//get all comments by postId
router.get('/post/:postId', middleware.validate([
    param('postId').isMongoId().withMessage("invalid postId")
]), middleware.authenticateToken, async (req,res) => {
    
    try{
        const comments = await Comment.find({ postId : req.params.postId}).populate('userId', "name profilePic _id").lean();
 
        return res.status(200).json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : comments
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            status : 'error',
            message : 'Internal server error'
        });
    };

});


//get comment by commentId
router.get('/commentid/:commentId', middleware.validate([
    param('commentId').isMongoId().withMessage('Invalid commentId')
]), middleware.authenticateToken, async (req,res) => {
    try{
        const comment = await Comment.findById(req.params.commentId).populate('userId', "name profilePic _id").lean();
        if(!comment){
            return res.status(404).json({
                status : 'error',
                message : "Comment not found"});
        };
        return res.status(200).json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : comment
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            status : 'error',
            message : 'Internal server error'
        });
    };
});


//get comment by userId
router.get('/user/:userId', middleware.validate([
    param('userId').isMongoId().withMessage('Invalid userId')
]), middleware.authenticateToken, async (req,res)=>{
    try{
        const comments = await Comment.find({userId : req.params.userId}).populate('userId', 'name _id profilePic').lean();
        return res.status(200).json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : comments
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



//post comment
router.post('/postcomment/:postId', middleware.validate([
    param('postId').isMongoId().withMessage('Invalid posId'),
    body('comment').not().isEmpty().withMessage('Content is required').trim().escape()
]), middleware.authenticateToken, async (req,res) => {
    const comment = new Comment( { 
        postId : req.params.postId,
        userId : req.user.id,
        comment : req.body.comment

    })
    try{
        await comment.save();
        return res.status(201).json({
            status : 'success',
            message : 'Comment posted successfully',
            data : comment
        });
    }catch(err) {
        console.log(err);
        return res.status(500).json({
            status :  'error',
            message : 'Internal server error'});
    }
});


//delete comment
router.delete('/deletecomment/:commentId', middleware.validate([
    param('commentId').isMongoId().withMessage('Invalid commentId')
]), middleware.authenticateToken, async (req,res)=>{
    try{
        const comment = await Comment.findOne({ _id : req.params.commentId, userId : req.user.id});
        if(!comment){
            return res.status(404).json({ 
                staus : 'error',
                message : "User's comment not found"});
        }
        await comment.deleteOne();
        return res.status(200).json({ 
            status : 'success',
            message : "Comment delete successfully"
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message: 'Internal server error'
        });
    };
});

module.exports = router;