const mongoose = require("mongoose");


const followSchema = mongoose.Schema({
    followerId : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        require : true,
    },
    followingId : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        require : true,
    },
    createdAt : {
        type : Date,
        default : Date.now,
    }
});


module.exports = mongoose.model("Follow", followSchema);