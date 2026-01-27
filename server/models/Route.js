const mongoose = require('mongoose');

const routeStopSchema = new mongoose.Schema(
  {
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {_id: false},
);

const routeSchema = new mongoose.Schema(
  {
    routeName: {type: String, required: true},
    routeCode: {type: String, required: true, unique: true},

    stops: [routeStopSchema],

    polyline: [[Number]],
    totalDistance: Number,
    isActive: {type: Boolean, default: true},
  },
  {timestamps: true},
);

// routeSchema.index({'stops.location':'2dsphere'});

module.exports = mongoose.model('Route', routeSchema);