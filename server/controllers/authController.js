const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateOtp = require('../utils/generateOtp');
const googleClient = require('../config/googleClient');
const sendOtpMail = require('../utils/sendOtpMail');
const sendMagicLinkEmail = require('../utils/sendMagicLinkEmail');
const crypto = require('crypto');

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {expiresIn: "360d"}
  );
};


const requestOtp = async(req,res)=>{
    try {
        const {email} = req.body;
        let user = await User.findOne({email})

        if(!user){
            user= await User.create({email});
        }

        const otp = generateOtp();
        user.otp = {
          code: otp,
          expireAt:Date.now() + 5*60*1000
        };

        await user.save();
        await sendOtpMail(email,otp)

        res
          .status(200)
          .json({success: true, message: "OTP sent to your email"});
    } catch (error) {
        res.status(500).json({success:false,message:"Error sending OTP",error:error.message});
    }
}

const verifyOtp = async(req,res)=>{
    const {email,otp} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user || !user.otp){
            return res.status(400).json({success:false,message:"Invalid request"});
        }

        if(user.otp.code !== otp){
            return res.status(400).json({success:false,message:"Invalid OTP"});
        }
        if(user.otp.expireAt < Date.now()){
            return res.status(400).json({success:false,message:"OTP expired"});
        }

        user.isVerified = true;
        user.otp = null;
        await user.save();

        const token = createToken(user);
        res.status(200).json({success:true,message:"OTP verified successfully",token,user:{id:user._id,email:user.email,role:user.role}});
    } catch (error) {
        res.status(500).json({success:false,message:"Error verifying OTP",error:error.message});
    }
}

const googleLogin = async(req,res)=>{
    try {
        const {idToken} = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const {email,sub} = ticket.getPayload();
        let user = await User.findOne({googleId:sub});
        if(!user){
            user = await User.create({
                email, 
                googleId:sub,
                isVerified:true,
            })
        }
        const token = createToken(user);
        res.status(200).json({success:true,message:"Login successful",token,user:{id:user._id,email:user.email,role:user.role}});
    } catch (error) {
        res.status(500).json({success:false,message:"Error during Google login",error:error.message});
    }
}

const getMe = async(req,res)=>{
    try {
        const user = await User.findById(req.user.userId).select('-otp -googleId');
        res.status(200).json({success:true,user});
    } catch (error) {
        res.status(500).json({success:false,message:"Error fetching user data",error:error.message});
    }
}

const addDriver = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only",
      });
    }

    const {email,name} = req.body;

    let driver = await User.findOne({email});

    if (driver) {
      if (driver.role !== "driver") {
        driver.role = "driver";
      }
    } else {
      driver = new User({
        email,
        name,
        role: "driver",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    driver.magicLink = {
      token,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    driver.isVerified = false; // force fresh login
    await driver.save();

    const link = `${process.env.FRONTEND_URL}/magic-link?token=${token}`;

    await sendMagicLinkEmail(driver.email, link);
    // await sendMagicLinkEmail(
    //   "repemal776@imfaya.com",
    //   "http://localhost:3000/driver-login?token=abc123"
    // );


    return res.status(200).json({
      success: true,
      message: "Magic link sent to driver",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding driver",
      error: error.message,
    });
  }
};

const magicLinkLogin = async(req,res)=>{
  try {
    const {token} = req.body;

    const user = await User.findOne({
      "magicLink.token": token,
      "magicLink.expiresAt": {$gt: Date.now()},
    });

    if(!user){
      return res.status(400).json({success:false,message:"Invalid or expired Link"})
    }

    user.magicLink = undefined
    user.isVerified = true;

    await user.save()

    const authToken = createToken(user)

    return res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Magic link login failed",
      });
  }
}

module.exports = {
    requestOtp,
    verifyOtp,
    googleLogin,
    getMe,
    addDriver,
    magicLinkLogin
}
