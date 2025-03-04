const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const {body, param , validationResult, query} = require('express-validator');
const jwt = require("jsonwebtoken");
const { default: mongoose } = require('mongoose');
const dotenv = require('dotenv').config();


// get user middleware
const getUser = async (req,res,next) => {
    let user;
    try{
        user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                status : 'error',
                message :"User not found"
            }); 
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            status : 'error',
            message: 'Internal server error - Failed to get user',
        });
    }
    req.targetUser =user;
    next();
};

//validation middleware
const validateUser = (validations) => { 
    return async (req,res,next) => {
        for ( const validation of validations ){
            const result = await validation.run(req);
            if(!result.isEmpty()){
                return res.status(400).json({ 
                    status : 'error',
                    message : "Validation failed",
                    error: result.array()
                });
            }
        }
        next();
    }; 
};

//hash password middleware
const hashPassword = async (req, res, next) => {
    const saltRound = 10;
    
    try{
        if(!req.body.password){
            return res.status(404).json({
                status : 'error',
                message : "password is required"})
        };
        req.body.password = await bcrypt.hash(req.body.password, saltRound);
        next();
    }catch(err){
        console.log(err);
        return res.status(500).json({ 
            status : 'error',
            message: "error hash password", 
        });
    };
};

// verify token middleware
const authenticateToken = async (req,res,next) => {

    const token = req.header("Authorization")?.split(" ")[1];// Format: Bearer <token>
    if(!token){
        return res.status(401).json({
            status : 'error',
            message : "Unauthorized - Token is missing",
        });
    };
    try {
        //verify token return payload
        const verified = jwt.verify(token, process.env.SECRET_KEY);

        //check if user exist
        const user = await User.findById(verified.id);
        if(!user){
            return res.status(404).json({
                status : 'error',
                message : 'User Not Found'
            });
        };
        req.user = user;
        next();
    }catch(err){
        console.log(err);
        return res.status(401).json({
            status : 'error',
            message : "Unauthorized - Invalid Token",
        });
    };
};


//get all user with pagination
router.get('/', validateUser([
    query('page').optional().isInt({ min : 1}).withMessage('page must be positive number'),
    query("limit").optional().isInt({ min : 1}).withMessage('limit must be positive number'),
]), async (req,res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    try{
        const users = await User.find().skip(skip).limit(limit);
        const totalDocuments = await User.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);

        res.status(200).json({
            status : "success",
            message : "Data successfully retrieved",
            data : users,
            pagination : {
                currentPage : page,
                totalPage : totalPages,
                totalDocuments : totalDocuments,
                perPage : limit,
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            status : 'error',
            message: 'Internal Server Error',
        });
    }
});



//register user
router.post('/', validateUser([
    body("name").isString().notEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6, max:12}).withMessage("pasword must be at least 6 character and max 12")
]),hashPassword, async (req,res) => {
    
    const existingUser = await User.findOne({ email : req.body.email});
    if(existingUser){
        return res.status(400).json({
            status : 'error',
            message : 'Email already exist'
        })
    }
    
    const user = new User({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password
    });

    try{
        const newUser = await user.save();
        res.status(201).json({
            status : "success",
            message : "Data successfully create",
            data : newUser
        });
    }catch(err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ 
                status : 'error',
                message: "Email already exists",
            });
        }
        res.status(500).json({
            status : 'error',
            message: 'internal server error',
        });
    };
});


router.get('/profile', authenticateToken, (req,res) => {
    res.status(200).json({
        status : "success",
        message : "Data successfully retrieved",
        data : {
            name : req.user.name,
            email : req.user.email,
            profilePic : req.user.profilePic,
            bio : req.user.bio,
            followersCount : req.user.followersCount,
            followingCount : req.user.followingCount
        }});
});



//login user
router.post('/login', validateUser([
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min:6, max:12})
]), async (req,res)=> {
    try{
    
        const user = await User.findOne({ email: req.body.email});
        if(!user){
            return res.status(404).json({ 
                status : 'error',
                message: "Invalid email or password"
            });
        };

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword){
            return res.status(400).json({ 
                status : 'error',
                message : "Invalid email or password"
            });
        };

        const token = jwt.sign(
            {id : user._id, name: user.name},
            process.env.SECRET_KEY,{ expiresIn : '24h'}
        );

        return res.status(200).json({
            status : "success",
            message : "Login Success",
            data : {
                token : token
            }
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            status : 'error',
            message : 'Internal server error',
        });
    }

});



//get user by userId
router.get('/:id', validateUser([
    param("id").isMongoId().withMessage("invalid id")
]), getUser, authenticateToken, async (req,res) => {

    try{
        return res.status(200).json({
            status : 'success',
            message : 'Data successfully retrieved',
            data : {
                name : req.targetUser.name,
                profilePic : req.targetUser.profilePic,
                bio : req.targetUser.bio,
                followersCount : req.targetUser.followersCount,
                followingCount : req.targetUser.followingCount
            }
        });
    }catch(err){
        console.log(err)
        return res.status(500).json({
            status : "error",
            message : "Internal server error"
        });

    };
    
});



//update user
router.patch('/updateprofile', validateUser([
    body('name').optional().isString().notEmpty().trim().escape(),
    body('bio').optional().isString().trim().escape(),
    body('profilePic').optional().isString().trim().escape(),
    body('email').optional().isEmail().normalizeEmail()
]), authenticateToken, async (req,res) => {

    try{

        if(req.body.email){
            const existingUser = await User.findOne({ email : req.body.email});
            if(existingUser && existingUser.id !== req.user.id ){
                return res.status(400).json({
                    status : 'error',
                    message : 'Email already exist'
                })
            }
        }

        const allowedFields = ['name', 'bio', 'profilePic', 'email'];

        const updateData = Object.keys(req.body).reduce((acc,key)=>{
            if(allowedFields.includes(key)){
                acc[key] = req.body[key]
            };
            return acc;
        }, {});

        const updateUser = await User.findOneAndUpdate(
            {_id : req.user.id}, 
            {$set : updateData}, 
            { new : true, runValidators : true}
        );
        
        return res.status(200).json({
            status : "success", 
            message : "Data successfully update",
            data : {
                user : updateUser
            }
        }); 
    }catch(err){
        console.log(err);
        return res.status(500).json({
            status : 'error',
            message : 'Internal server error',
        });
    };
});


//delete user
router.delete('/deleteuser', authenticateToken, async (req,res) => {
    try{
        const user = await User.findOneAndDelete({ _id : req.user.id});
        
        if(!user){
            return res.status(404).json({
                status : 'error',
                message : "User not found"
            });
        }

        res.status(200).json({
            status : 'success',
            message : "User and all related data deleted successfully"
        });
    }catch(err){
        console.log(err)
        res.status(500).json({
            status : 'error',
            message : 'Internal server error'
        });
    }
})





module.exports = router;