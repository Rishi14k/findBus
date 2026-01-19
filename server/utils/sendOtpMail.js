const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


module.exports = async(email,otp)=>{
    await transporter.sendMail({
        from:`"Bus Tracker" <${process.env.MAIL_USER}>`,
        to:email,
        subject:"Your OTP for Bus Tracker",
        html:`<p>Your OTP for Bus Tracker is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    })
}