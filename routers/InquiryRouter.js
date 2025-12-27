const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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