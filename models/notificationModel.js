const mongoose = require('mongoose');


const notificationSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        require : true,
    },
    type : {
        type : String,
        require : true,
    },
    message : {
        type : String,
        require : true,
    },
    isRead : {
        type : Boolean,
        default : false,
    },
    createdAt : {
        type : Date,
        default : Date.now,
    }

});

notificationSchema.index({ isRead : 1});

module.exports = mongoose.model( "Notification". notificationSchema);