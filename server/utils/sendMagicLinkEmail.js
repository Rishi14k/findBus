
const axios = require("axios");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

module.exports = async (toEmail, magicLink) => {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: "Bus Tracker",
          email: process.env.BREVO_SENDER_EMAIL, // Must be verified in Brevo
        },
        to: [
          {
            email: toEmail,
          },
        ],
        subject: "Driver Portal: Your Secure Login Link",
        htmlContent: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 450px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <div style="background-color: #1e88e5; padding: 25px; text-align: center;">
                    <span style="font-size: 40px;">🚌</span>
                    <h2 style="color: #ffffff; margin: 10px 0 0 0; font-weight: 600; letter-spacing: 0.5px;">Driver Portal</h2>
                </div>
                
                <div style="padding: 30px; background-color: #ffffff;">
                    <p style="font-size: 16px; color: #444; margin-bottom: 20px;">
                        Hello, <br><br>
                        You have been authorized as a <b>Driver</b>. Use the button below to sign in to your dashboard safely.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${magicLink}" 
                           style="background-color: #1e88e5; color: white; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 136, 229, 0.3);">
                            Log In to Dashboard
                        </a>
                    </div>
                    
                    <div style="background-color: #fff9c4; border-left: 4px solid #fbc02d; padding: 15px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 14px; color: #6d4c41;">
                            <b>Security Note:</b> This link expires in <b>15 minutes</b> and can only be used once.
                        </p>
                    </div>

                    <p style="font-size: 13px; color: #888; line-height: 1.5;">
                        If the button doesn't work, copy and paste this URL into your browser:<br>
                        <span style="color: #1e88e5; word-break: break-all;">${magicLink}</span>
                    </p>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                    <p style="margin: 0; font-size: 12px; color: #999;">
                        &copy; ${new Date().getFullYear()} Bus Tracker Admin System <br>
                        <i>Confidential Driver Access</i>
                    </p>
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

    console.log("Brevo Magic Link email sent ✅", response.data);
  } catch (error) {
    console.error(
      "Brevo Magic Link email error ❌",
      error.response?.data || error.message,
    );
    throw new Error("Failed to send magic link email");
  }
};