const express = require('express');
const router = express.Router();
const {authMiddleware, adminOnly} = require("../middleware/authMiddleware");
const {
  requestOtp,
  verifyOtp,
  googleLogin,
  getMe,
  addDriver,
} = require("../controllers/authController");

router.post('/request-otp',requestOtp);
router.post('/verify-otp',verifyOtp);
router.post('/google-login',googleLogin);
router.get('/me',authMiddleware,getMe);

//admin
router.post('/add-driver',authMiddleware,adminOnly,addDriver);

module.exports = router;