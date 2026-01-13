// utils/emailVerification.js
const { Resend } = require('resend');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerification = async (email, verificationLink) => {
  try {
    const { data, error } = await resend.emails.send({
      // Ensure this email uses your verified domain
      from: 'Crystal Ices <onboarding@crystalices.site>',
      to: [email],
      subject: "Verify Your Account - Crystal Ices",
      html: `
        <div style="width: 100%; max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
          <div style="background-color: #0B2A4A; padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Crystal Ices</h1>
          </div>
          <div style="padding: 40px; color: #1e293b; text-align: center;">
            <h2 style="margin-bottom: 20px;">Confirm your email address</h2>
            <p style="color: #64748b; line-height: 1.6;">
              Thank you for registering. Please click the button below to verify your account.
            </p>
            <div style="margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #0B2A4A; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
                Verify My Account
              </a>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">This link expires in 15 minutes.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Email sent successfully:", data.id);
    return data;
  } catch (err) {
    console.error("❌ Resend catch block:", err.message);
    throw err; // Re-throw so the controller knows it failed
  }
};

module.exports = { sendVerification };