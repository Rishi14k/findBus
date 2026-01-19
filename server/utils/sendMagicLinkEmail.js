const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS,
    },
    tls:{
        rejectUnauthorized:false,
    }
})

module.exports = async (toEmail, magicLink) => {
   try {
     await transporter.sendMail({
       from: `"Bus Tracker Admin" <${process.env.MAIL_USER}>`,
       to: toEmail,
       subject: "Driver Login Access – Magic Link",
       html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Driver Login Access</h2>
          <p>You have been added as a <b>driver</b> in the Bus Tracking system.</p>
          <p>Click the button below to login:</p>

          <a href="${magicLink}"
             style="
               display:inline-block;
               padding:12px 20px;
               background:#1e88e5;
               color:#ffffff;
               text-decoration:none;
               border-radius:4px;
               font-weight:bold;
             ">
             Login as Driver
          </a>

          <p style="margin-top:15px;">
            ⏱ This link is valid for <b>15 minutes</b> only.
          </p>

          <p>If you didn’t request this, ignore this email.</p>

          <hr />
          <p style="font-size:12px;color:#777;">
            Bus Tracker System
          </p>
        </div>
      `,
    });
    console.log("Magic link email sent to:", toEmail)
   } catch (error) {
    console.error("Magic link email error:", error);
    throw new Error("Failed to send magic link email");
   }
};