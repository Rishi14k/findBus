
const axios = require("axios");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

module.exports = async (email, otp) => {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: "Bus Tracker",
          email: process.env.BREVO_SENDER_EMAIL, // must be verified in Brevo
        },
        to: [
          {
            email,
          },
        ],
        subject: "Verification Code - Bus Tracker",
        htmlContent: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #007bff; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Bus Tracker</h1>
            </div>

            <div style="padding: 30px; color: #333333; line-height: 1.6;">
              <h2 style="margin-top: 0;">Verify Your Email</h2>
              <p>Hello,</p>
              <p>Use the verification code below to complete your sign-in. This code is valid for <b>5 minutes</b>.</p>

              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 15px 30px; background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 4px;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">
                    ${otp}
                  </span>
                </div>
              </div>

              <p style="font-size: 0.9em; color: #666;">
                If you didn’t request this code, you can safely ignore this email.
              </p>
            </div>

            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} Bus Tracker Team. All rights reserved.
            </div>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      },
    );

    console.log("Brevo OTP email sent ✅", response.data);
  } catch (error) {
    console.error(
      "Brevo OTP email error ❌",
      error.response?.data || error.message,
    );
    throw new Error("Failed to send OTP email");
  }
};
