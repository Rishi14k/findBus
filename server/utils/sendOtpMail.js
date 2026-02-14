const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // MUST be false for port 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});


module.exports = async (email, otp) => {
  await transporter.sendMail({
    from: `"Bus Tracker" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Verification Code - Bus Tracker",
    html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #007bff; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Bus Tracker</h1>
            </div>
            
            <div style="padding: 30px; color: #333333; line-height: 1.6;">
                <h2 style="margin-top: 0; color: #333333;">Verify Your Email</h2>
                <p>Hello,</p>
                <p>Use the verification code below to complete your sign-in. This code is valid for <b>5 minutes</b>.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; padding: 15px 30px; background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 4px;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">${otp}</span>
                    </div>
                </div>
                
                <p style="font-size: 0.9em; color: #666666;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
            
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
                &copy; ${new Date().getFullYear()} Bus Tracker Team. All rights reserved.
            </div>
        </div>
        `,
  });
};
