const mongoose = require("mongoose");

const liveBusSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
        required: true,
      },
    },
    speed: Number, // in km/h
    heading: Number, // in degrees
    currentStopIndex: {
      type: Number,
    },
    nextStopIndex: {type: Number},
    status: {
      type: String,
      enum: ["running", "holding", "off-duty"],
      default: "off-duty",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    assignedBus:{
      type:Boolean,
      default:false
    }
  },
  {timestamps: true}
);

module.exports = mongoose.model("Livebus", liveBusSchema);
