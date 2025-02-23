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


followSchema.index({ followerId : 1});
followSchema.index({ followingId : 1});

module.exports = mongoose.model("Follow", followSchema);