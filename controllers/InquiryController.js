const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { transporter } = require("../utils/emailVerification"); // Reuse your email config

exports.submitInquiry = async (req, res) => {
  const { fullName, email, service, requirements } = req.body;

  try {
    // 1. Save to Database
    const newInquiry = await prisma.inquiry.create({
      data: { fullName, email, service, requirements }
    });

    // 2. Send Confirmation Email to the User
    const userMailOptions = {
      from: '"Crystal Ices" <georgechiamaka02@gmail.com>',
      to: email,
      subject: 'Inquiry Received - Crystal Ices',
      html: `<h3>Hello ${fullName},</h3><p>We have received your request for <b>${service}</b>. Our engineering team will review it and get back to you within 24 hours.</p>`
    };

    // 3. (Optional) Send Notification to YOURSELF
    const adminMailOptions = {
      from: 'system@crystalices.com',
      to: 'georgechiamaka02@gmail.com',
      subject: 'NEW WEBSITE INQUIRY',
      text: `New inquiry from ${fullName} (${email}) for ${service}. Requirements: ${requirements}`
    };

    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.status(201).json({ success: true, message: "Inquiry submitted successfully!" });
  } catch (error) {
    console.error("Inquiry Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit inquiry." });
  }
};