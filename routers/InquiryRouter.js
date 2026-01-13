const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { Resend } = require('resend'); // 1. Added Resend import

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY); // 2. Initialized Resend with your Key

// 1. SUBMIT NEW INQUIRY
router.post('/submit', async (req, res) => {
    const { fullName, email, service, requirements, userId } = req.body;

    if (!fullName || !email || !requirements) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        const inquiry = await prisma.inquiry.create({
            data: {
                fullName,
                email,
                service,
                requirements,
                status: "PENDING",
                userId: userId || null
            }
        });

        // 3. Send the notification email
        await resend.emails.send({
            from: 'Crystal Ices <onboarding@crystalices.site>',
            to: ['your-email@gmail.com'], // Put your personal email here
            subject: `New Inquiry: ${service}`,
            html: `
                <h3>New Message from ${fullName}</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Requirements:</strong> ${requirements}</p>
            `
        });

        res.status(201).json({ success: true, data: inquiry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET ALL INQUIRIES
router.get('/all', async (req, res) => {
    try {
        const inquiries = await prisma.inquiry.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });
        res.json({ success: true, data: inquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. UPDATE STATUS
router.put('/update-status/:id', async (req, res) => {
    const { status } = req.body;
    try {
        const updated = await prisma.inquiry.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Status update failed. Ensure status is a valid Enum value." });
    }
});

// 4. GET STATS
router.get('/stats', async (req, res) => {
    try {
        const stats = await prisma.inquiry.groupBy({
            by: ['status'],
            _count: { id: true }
        });

        const formatted = stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, { PENDING: 0, PROCESSING: 0, COMPLETED: 0, CANCELLED: 0 });

        res.json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;