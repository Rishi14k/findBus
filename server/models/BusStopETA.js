const mongoose = require('mongoose');

const busStopETASchema = new mongoose.Schema({
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
    required: true,
  },
  stopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BusStop",
    required: true,
  },
  etaTimestamp:{
    type: Date,
    required: true
  },
  calculatedAt:{
    type: Date,
    default: Date.now
  }
},{timestamps:true});

module.exports = mongoose.model('BusStopETA', busStopETASchema);