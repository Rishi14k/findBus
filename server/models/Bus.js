const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {type: String, required: true, unique: true},
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
      trim: true,
    },
    fare: {type: Number, required: true},
    serviceType: {
      type: String,
      enum: ["A/C", "Non A/C"],
      default: "Non A/C",
    },
    totalStops: {type: Number, required: true},
    isActive: {type: Boolean, default: true},
  },
  {timestamps: true},
);

module.exports = mongoose.model('Bus', busSchema);