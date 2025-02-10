const mongoose = require("mongoose");


const mediaSchema = mongoose.Schema({
    userId : { 
        type : mongoose.Schema.ObjectId,
        ref : "User",
        require : true,
    },
    type : {
        type : String,
        require : true,
    },
    url : {
        type : String,
        require : true,
    },
    uploadAt : {
        type : Date,
        default : Date.now
    }
});


module.exports = mongoose.model("Media", mediaSchema);