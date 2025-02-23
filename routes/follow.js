const Follow = require('../models/followModel');
const express = require('express');
const router = express.Router();
const { body, param} = require('express-validator');
const middleware = require('../middleware/middleware');
const User = require('../models/userModel');


// get follower by userId
router.get('/follower/:userId', middleware.validate([
    param("userId").isMongoId().withMessage('Invalid userId param')
]), middleware.getTokenUser, async (req,res)=> {

    try{
        const follower = await Follow.find({followingId : req.params.userId}).lean();
        const followerID = follower.map(follow => follow.followerId);

        const userFollowers = await User.find({ _id: { $in: followerID}}).select("_id name profilePic bio followersCount followingCount").lean();

        return res.status(200).json(userFollowers);
    }catch(err){
        return res.status(500).json({ message : err.message});
    }
});

//get following by userId
router.get('/following/:userId', middleware.validate([
    param("userId").isMongoId().withMessage('Invalid userId param')
]), middleware.getTokenUser, async (req,res)=> {
    
    try{
        const following = await Follow.find({followerId : req.params.userId});
        const followingID = following.map(f => f.followingId);

        const userFollowing = await User.find({ _id : {$in : followingID}}).select("_id name profilePic followersCount followingCount").lean()
        return res.status(200).json(userFollowing);
    }catch(err){
        return res.status(500).json({ message : err.message});
    }
});

//follow user
router.post('/following/:userId', middleware.validate([
    param('userId').isMongoId().withMessage('Invalid UserId param')
]), middleware.getUser, middleware.getTokenUser, async (req,res)=> {
    try{
        const follow = new Follow({
            followingId : req.params.userId,
            followerId : req.user.id,
        });
        await follow.save();
        return res.status(201).json({message : 'successfully follow',
            following : follow
        })

    }catch(err){
        return res.status(500).json({message : err.message});
    }
});


//unfollow user
router.delete('/unfollow/:userId', middleware.validate([
    param('userId').isMongoId().withMessage('Invalid UserId param')
]), middleware.getUser, middleware.getTokenUser, async (req,res)=> {
    try{
        const follow = await Follow.findOne({followingId : req.params.userId, followerId : req.user.id});
        if(!follow){
            return res.status(404).json({message : 'Follow not found'});
        }
        await follow.deleteOne();
        return res.status(200).json({message : 'Successfully unfollow'});
    }catch(err){
        return res.status(500).json({message : err.message});
    }
});

module.exports = router;