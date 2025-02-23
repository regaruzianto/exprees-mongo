const Comment = require('../models/commentModel');
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/middleware');
const {body, param } = require('express-validator');
const User = require("../models/userModel");



//get all comment 
router.get('/', async (req,res) => {
    try{
        const comments = await Comment.find();
        return res.status(200).json(comments);
    }catch(err){
        return res.status(500).json({ message : err.message});
    }
    
});


//get comment by postId
// router.get('/post/:postId', middleware.validate([
//     param('postId').isMongoId().withMessage("invalid postId")
// ]), middleware.getTokenUser, async (req,res) => {

//     try{
//         const comments = await Comment.find({ postId : req.params.postId});
//         return res.status(200).json(comments);
//     }catch(err){
//         return res.status(500).json({message : err.message});
//     }

// });


router.get('/post/:postId', middleware.validate([
    param('postId').isMongoId().withMessage("invalid postId")
]), middleware.getTokenUser, async (req,res) => {
    let commentRes = [];
    
    try{
        const comments = await Comment.find({ postId : req.params.postId});
        comments.map( async comment => {
            const user = await User.findById(comment.userId);
            let temp = {};
            temp[comment] = comment;
            temp[username] = user.name;
            commentRes.push(temp);
            
        })
 
        return res.status(200).json(commentRes);
    }catch(err){
        return res.status(500).json({message : err.message});
    }

});


//get comment by commentId
router.get('/commentid/:commentId', middleware.validate([
    param('commentId').isMongoId().withMessage('Invalid commentId')
]), middleware.getTokenUser, async (req,res) => {
    try{
        const comment = await Comment.findById(req.params.commentId);
        if(!comment){
            return res.status(404).json({message : "Comment not found"});

        }
        return res.status(200).json(comment);
    }catch(err){
        return res.status(500).json({ message : err.message});
    }
});


//get comment by userId
router.get('/user/:userId', middleware.validate([
    param('userId').isMongoId().withMessage('Invalid userId')
]), middleware.getTokenUser, async (req,res)=>{
    try{
        const comments = await Comment.find({userId : req.params.userId});
        return res.status(200).json(comments);
    }
    catch(err){
        return res.status(500).json({message : err.message});
    }
});



//post comment
router.post('/postcomment/:postId', middleware.validate([
    param('postId').isMongoId().withMessage('Invalid posId'),
    body('comment').not().isEmpty().withMessage('Content is required').trim().escape()
]), middleware.getTokenUser, async (req,res) => {
    const comment = new Comment( { 
        postId : req.params.postId,
        userId : req.user.id,
        comment : req.body.comment

    })
    try{
        await comment.save();
        return res.status(201).json(comment);
    }catch(err) {
        return res.status(500).json({ message : err.message});
    }
});


//delete comment
router.delete('/deletecomment/:commentId', middleware.validate([
    param('commentId').isMongoId().withMessage('Invalid commentId')
]), middleware.getTokenUser, async (req,res)=>{
    try{
        const comment = await Comment.findOne({ _id : req.params.commentId, userId : req.user.id});
        if(!comment){
            return res.status(404).json({ message : "User's comment not found"});
        }
        await comment.deleteOne();
        return res.status(200).json({ message : "Comment delete successfully"});
    }catch(err){
        return res.status(500).json({ message: err.message});
    }
})

module.exports = router;