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
                fullName, email, service, requirements,
                status: "PENDING",
                userId: userId ? parseInt(userId) : null 
            }
        });
        res.status(201).json({ success: true, data: inquiry });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// 2. GET ALL INQUIRIES
router.get('/all', async (req, res) => {
    try {
        const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });
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
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed." });
    }
});

// 4. DELETE
router.delete('/delete/:id', async (req, res) => {
    try {
        await prisma.inquiry.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true, message: "Deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed." });
    }
});

// 5. GET STATS (New)
router.get('/stats', async (req, res) => {
    try {
        const stats = await prisma.inquiry.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        const formatted = stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, { PENDING: 0, CONTACTED: 0, COMPLETED: 0 });
        res.json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;