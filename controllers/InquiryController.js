const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { transporter } = require("../utils/emailVerification");

// --- SUBMIT INQUIRY (Public) ---
exports.submitInquiry = async (req, res) => {
  const { fullName, email, service, requirements } = req.body;
  try {
    const newInquiry = await prisma.inquiry.create({
      data: { 
        fullName, 
        email, 
        service, 
        requirements,
        status: "PENDING" // Ensure default status
      }
    });

    // Email logic
    const userMailOptions = {
      from: '"Crystal Ices" <georgechiamaka02@gmail.com>',
      to: email,
      subject: 'Inquiry Received - Crystal Ices',
      html: `<h3>Hello ${fullName},</h3><p>We have received your request for <b>${service}</b>.</p>`
    };
    
    await transporter.sendMail(userMailOptions);

    res.status(201).json({ success: true, message: "Inquiry submitted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit inquiry." });
  }
};

// --- GET ALL INQUIRIES (Admin/Dashboard) ---
// controllers/inquiryController.js

exports.getAllInquiries = async (req, res) => {
  try {
    const { id, role } = req.user; // Assuming you have auth middleware providing this

    let inquiries;

    if (role === "ADMIN" || role === "STAFF") {
      // Admins and Staff see everything
      inquiries = await prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Clients see ONLY their own based on the email or userId
      inquiries = await prisma.inquiry.findMany({
        where: { 
          // Match by userId or the email stored in the Inquiry record
          email: req.user.email 
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch inquiries" });
  }
};

// --- UPDATE INQUIRY STATUS (Dashboard Dropdown) ---
exports.updateInquiryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // PENDING, CONTACTED, or COMPLETED
  try {
    const updated = await prisma.inquiry.update({
      where: { id: id },
      data: { status: status }
    });
    res.status(200).json({ success: true, message: "Status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// --- GET STATISTICS (Command Center Cards) ---
exports.getInquiryStats = async (req, res) => {
  try {
    const stats = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    // Format for the frontend cards
    const data = {
      PENDING: 0,
      CONTACTED: 0,
      COMPLETED: 0
    };

    stats.forEach(item => {
      data[item.status] = item._count._all;
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Stats error" });
  }
};