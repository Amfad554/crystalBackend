const { Resend } = require('resend');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const sendVerification = async (email, verificationLink) => {
  if (!resend) {
    console.error("❌ Resend API Key is missing.");
    throw new Error("Email service not configured.");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Crystal Ices <onboarding@crystalices.site>',
      to: [email],
      subject: "Verify Your Industrial Portal Account",
      html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f4f7f9;
                        padding: 20px;
                    }
                    .card {
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                        border: 1px solid #e1e8ed;
                    }
                    .header {
                        background-color: #0B2A4A;
                        padding: 30px;
                        text-align: center;
                        color: #ffffff;
                    }
                    .content {
                        padding: 40px 30px;
                        text-align: center;
                        color: #334155;
                    }
                    .button {
                        display: inline-block;
                        background-color: #0B2A4A;
                        color: #ffffff !important;
                        padding: 16px 32px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        margin: 25px 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        font-size: 14px;
                    }
                    .footer {
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #94a3b8;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="card">
                        <div class="header">
                            <h1 style="margin:0; font-size: 24px; letter-spacing: 2px;">CRYSTAL ICES</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #0F172A; margin-top: 0;">Confirm Your Email</h2>
                            <p style="line-height: 1.6;">Thank you for joining the Crystal Ices Industrial Portal. To access our fleet and services, please verify your email address by clicking the button below.</p>
                            
                            <a href="${verificationLink}" class="button">Verify My Account</a>
                            
                            <p style="font-size: 13px; color: #64748b;">This link will expire in 15 minutes. If you did not create an account, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            &copy; ${new Date().getFullYear()} Crystal Ices Energies Nigeria Limited.
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("❌ Mail Dispatch Error:", err.message);
    throw err;
  }
};

module.exports = { sendVerification };