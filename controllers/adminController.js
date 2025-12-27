const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// --- STATS ---
exports.getDashboardStats = async (req, res) => {
  try {
    const inquiryStats = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const equipmentCount = await prisma.equipment.count();
    const staffCount = await prisma.staff.count();

    const formattedStats = inquiryStats.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, { PENDING: 0, PROCESSING: 0, COMPLETED: 0, CANCELLED: 0 });

    res.json({ success: true, stats: formattedStats, totals: { equipment: equipmentCount, staff: staffCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- STAFF ---
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching staff" });
  }
};

exports.addStaff = async (req, res) => {
  try {
    const newStaff = await prisma.staff.create({ data: req.body });
    res.status(201).json({ success: true, data: newStaff });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding staff" });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    await prisma.staff.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Staff removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// --- EQUIPMENT ---
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany();
    res.json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching equipment" });
  }
};

exports.addEquipment = async (req, res) => {
  try {
    const data = { ...req.body, dailyRate: parseFloat(req.body.dailyRate) };
    const newEquip = await prisma.equipment.create({ data });
    res.status(201).json({ success: true, data: newEquip });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding equipment" });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    await prisma.equipment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Asset deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};