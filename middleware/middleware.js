const express = require('express');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv').config();
const User = require("../models/userModel");
const { body, validationResult } = require('express-validator');


// get user middleware
const getUser = async (req,res,next) => {
    let user;
    try{
        user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({message :"User not found"}); 
        }
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
    res.targetUser =user;
    next();
};

//validation middleware
const validate = (validations) => { 
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

// verify token middleware
const authenticateToken = (req,res,next) => {

    const token = req.header("Authorization")?.split(" ")[1];// Format: Bearer <token>
    if(!token){
        return res.status(401).json({message : "Unauthorized"});
    };
    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;
        req.userId = verified.id;
        next();
    }catch(err){
        return res.status(401).json({message : "Invalid Token"});
    }
}


//get tokenUser
const getTokenUser = async (req,res,next) => {

    const token = req.header("Authorization")?.split(" ")[1];
    if(!token){
        return res.status(404).json({message : "Unauthorized Invalid token"});
    };
    try{
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(verified.id);
        if(!user){
            return res.status(404).json({message : "Unauthorized : User not found"});
        }
        req.user = user;
        next();
    }catch(err){
        return res.status(500).json({message : err.message});
    };
};


module.exports = {getUser, validate, authenticateToken, getTokenUser};