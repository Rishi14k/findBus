const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: {type: String, required: true},
  location: {
    type: {
      type:String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
        type:[Number],
        index:'2dsphere',
        required:true
    }
  },
  city:String,
  isActive: {type: Boolean, default: true},
},{ timestamps: true });

module.exports = mongoose.model('Stop', stopSchema);