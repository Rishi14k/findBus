const mongoose = require('mongoose');

const busServiceSchema = new mongoose.Schema({
    busId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Bus',
        required:true
    },
    driverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Driver',
        required:true
    },
    startTime:{
        type:Date
    },
    isActive:{
        type:Boolean,
        default:true}
},{timestamps:true})

module.exports = mongoose.model('BusService',busServiceSchema);