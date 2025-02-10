const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const {body, param , validationResult} = require('express-validator');
const jwt = require("jsonwebtoken");
const { default: mongoose } = require('mongoose');
const dotenv = require('dotenv').config();


// get user middleware
const getUser = async (req,res,next) => {
    let user;
    try{
        user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message :"User not found"}); 
        }
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
    res.user =user;
    next();
};

//validation middleware
const validateUser = (validations) => { 
    return async (req,res,next) => {
        for ( const validation of validations ){
            const result = await validation.run(req);
            if(!result.isEmpty()){
                return res.status(400).json({ error: result.array()});
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
            return res.status(404).json({message : "password is required"})
        };
        req.body.password = await bcrypt.hash(req.body.password, saltRound);
        next();
    }catch(err){
        return res.status(500).json({ message: "error hash pw ", err});
    };
};

// verify token middleware
const authenticateToken = (req,res,next) => {

    const token = req.header("Authorization")?.split(" ")[1];// Format: Bearer <token>
    if(!token){
        return res.status(401).json({message : "Unauthorized"});
    };
    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;
        next();
    }catch(err){
        return res.status(401).json({message : "Invalid Token"});
    }
}


router.get('/', async (req,res) => {
    try{
        const users = await User.find();
        res.json(users);
    }catch(err){
        console.log(err);
        res.status(500).json({message: err.message});
    }
});


router.post('/', validateUser([
    body("name").isString().notEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6, max:12}).withMessage("pasword must be at least 6 character and max 12")
]),hashPassword, async (req,res) => {
    const user = new User({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password
    });

    try{
        const newUser = await user.save();
        res.status(201).json(newUser);
    }catch(err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(400).json({message: err.message});
    };
});


router.get('/profile', authenticateToken, (req,res) => {
    res.json(req.user);
});


router.post('/login', validateUser([
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min:6, max:12})
]), async (req,res)=> {
    try{
    
        const user = await User.findOne({ email: req.body.email});
        if(!user){
            return res.status(404).json({ message: "error User not Found"});
        };

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword){
            return res.status(400).json({ message : "password invalid"});
        };

        const token = jwt.sign(
            {id : user._id, name: user.name},
            process.env.SECRET_KEY,{ expiresIn : '24h'}
        );

        return res.status(200).json({
            message : "Login Success",
            token : token
        });
    }
    catch(err){
        return res.status(500).json({message : err.message});
    }

});


router.get('/:id', validateUser([
    param("id").isMongoId().withMessage("invalid id")
]), getUser, (req,res) => {

    try{
        return res.json({name :res.user.name, email : res.user.email});
    }catch(err){
        return res.status(500).json({message : err.message});
    }
    
});


router.patch('/:id',getUser, async (req,res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    if (req.body.name != null) {
        res.user.name = req.body.name;
    }
    if (req.body.email != null) {
        res.user.email = req.body.email;
    }
    if (req.body.profilePic != null) {
        res.user.profilePic = req.body.profilePic;
    }
    if (req.body.bio != null) {
        res.user.bio = req.body.bio;
    }

    try{
        const updateUser = await res.user.save();
        return res.status(201).json({ 
            message : "update success",
            user : updateUser
        }); 
    }catch(err){
        return res.status(400).jsaon({message : err.message});
    };
});



router.delete('/:id', getUser, async (req,res) => {
    try{
        await res.user.deleteOne();
        res.json({message : "User deleted"});
    }catch(err){
        res.status(500).json({message : err.message});
    }
})





module.exports = router;