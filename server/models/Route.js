const mongoose = require('mongoose');

const routeStopSchema = new mongoose.Schema(
  {
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    name: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number],
    },
    order: {type: Number, required: true},
  },
  {_id: false}
);

const routeSchema = new mongoose.Schema({
    routeName: {type: String, required: true},
    routeCode: {type: String, required: true, unique: true},

    stops:[routeStopSchema],
    polyline:{
        type:[[Number]]
    },
    totalDistance:Number, // in kilometers
    isActive: {type: Boolean, default: true},
},{ timestamps: true });

routeSchema.index({'stops.location':'2dsphere'});

module.exports = mongoose.model('Route', routeSchema);