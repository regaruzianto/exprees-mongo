const Follow = require('../models/followModel');
const express = require('express');
const router = express.Router();
const { body, param} = require('express-validator');
const middleware = require('../middleware/middleware');
const User = require('../models/userModel');


// get follower by userId
router.get('/follower/:userId', middleware.validate([
    param("userId").isMongoId().withMessage('Invalid userId param')
]), middleware.authenticateToken, async (req,res)=> {

    try{
        const follower = await Follow.find({followingId : req.params.userId}).lean();
        const followerID = follower.map(follow => follow.followerId);

        const userFollowers = await User.find({ _id: { $in: followerID}}).select("_id name profilePic bio").lean();

        return res.status(200).json({
            status : 'success',
            message : 'Data successfully retrieved',
            data :  userFollowers
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message : 'Internal server error'
        });
    }
});

//get following by userId
router.get('/following/:userId', middleware.validate([
    param("userId").isMongoId().withMessage('Invalid userId param')
]), middleware.authenticateToken, async (req,res)=> {
    
    try{
        const following = await Follow.find({followerId : req.params.userId}).populate('followingId', 'name profilePic bio followersCount followingCount').lean();
        // const followingID = following.map(f => f.followingId);

        // const userFollowing = await User.find({ _id : {$in : followingID}}).select("_id name profilePic followersCount followingCount").lean()
        return res.status(200).json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : following
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message : 'Internal server error'
        });
    }
});

//follow user
router.post('/following/:userId', middleware.validate([
    param('userId').isMongoId().withMessage('Invalid UserId param')
]), middleware.getUser, middleware.authenticateToken, async (req,res)=> {
    
    if(req.params.userId === req.user.id){
        return res.status(400).json({
            status : 'error',
            message : 'You cannot follow yourself'
        });
    };
    
    try{
        const existingFollow = await Follow.findOne({followingId : req.params.userId, followerId : req.user.id});

        if(existingFollow){
            return res.status(400).json({
                status : 'error',
                message : 'user Already following'
            });
        };

        const follow = new Follow({
            followingId : req.params.userId,
            followerId : req.user.id,
        });
        await follow.save();
        return res.status(201).json({
            status : 'success',
            message : 'successfully follow',
            following : follow
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            status : 'error',
            message : 'Internal server error'
        });
    };
});


//unfollow user
router.delete('/unfollow/:userId', middleware.validate([
    param('userId').isMongoId().withMessage('Invalid UserId param')
]), middleware.getUser, middleware.authenticateToken, async (req,res)=> {
    try{
        const follow = await Follow.findOne({followingId : req.params.userId, followerId : req.user.id});
        if(!follow){
            return res.status(404).json({
                status : 'error',
                message : 'Follow not found'
            });
        }
        await follow.deleteOne();
        return res.status(200).json({
            status : 'success',
            message : 'Successfully unfollow'
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