
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {type: String},
    email: {type: String, unique: true, sparse: true},
    googleId: {type: String, unique: true, sparse: true},
    isVerified: {type: Boolean, default: false},
    role: {
      type: String,
      enum: ["user", "admin", "driver"],
      default: "user",
    },
    otp: {
      code: {type: String},
      expiresAt: {type: Date},
    },
    magicLink: {
      token: String,
      expiresAt: Date,
    },
    selectedBus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      default: null,
    },

    // password: {type: String, required: true},
  },
  {timestamps: true},
);

module.exports = mongoose.model('User', userSchema);