// controllers/adminController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// ─────────────────────────────────────────
// STATS
// ─────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const inquiryStats = await prisma.inquiry.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const equipmentCount = await prisma.equipment.count();
    const staffCount = await prisma.staff.count();

    const formattedStats = inquiryStats.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
      },
      { PENDING: 0, PROCESSING: 0, COMPLETED: 0, CANCELLED: 0 }
    );

    res.json({
      success: true,
      stats: formattedStats,
      totals: { equipment: equipmentCount, staff: staffCount },
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// EQUIPMENT
// ─────────────────────────────────────────
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error("Get equipment error:", error);
    res.status(500).json({ success: false, message: "Error fetching equipment" });
  }
};

exports.addEquipment = async (req, res) => {
  try {
    const { name, category, brand, region, description, dailyRate } = req.body;

    if (!name || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Name and category are required" });
    }

    // Upload image to Cloudinary if file was attached
    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, "image", "equipment");
      } catch (uploadErr) {
        console.error("Image upload failed:", uploadErr);
        // Don't crash the whole request — just save without image
      }
    }

    const parsedRate =
      dailyRate && !isNaN(dailyRate) ? parseFloat(dailyRate) : null;

    const newEquip = await prisma.equipment.create({
      data: {
        name,
        category,
        brand: brand || null,
        region: region || "Lagos",
        description: description || null,
        imageUrl,
        dailyRate: parsedRate,
      },
    });

    res.status(201).json({ success: true, data: newEquip });
  } catch (error) {
    console.error("Add equipment error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Failed to add equipment" });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, brand, region, dailyRate, description } = req.body;

    const updateData = {
      name,
      category,
      brand: brand || null,
      region: region || "Lagos",
      description: description || null,
      dailyRate:
        dailyRate && !isNaN(dailyRate) ? parseFloat(dailyRate) : null,
    };

    // Only update imageUrl if a new file was uploaded
    if (req.file) {
      try {
        updateData.imageUrl = await uploadToCloudinary(
          req.file.buffer,
          "image",
          "equipment"
        );
      } catch (uploadErr) {
        console.error("Image upload failed on update:", uploadErr);
      }
    }

    const updated = await prisma.equipment.update({
      where: { id }, // keep as string — works for cuid & uuid
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update equipment error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Update failed" });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    await prisma.equipment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Equipment deleted" });
  } catch (error) {
    console.error("Delete equipment error:", error);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// ─────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, data: staff });
  } catch (error) {
    console.error("Get staff error:", error);
    res.status(500).json({ success: false, message: "Error fetching staff" });
  }
};

exports.addStaff = async (req, res) => {
  try {
    const { name, role, specialty } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Staff name is required" });
    }

    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, "image", "staff_profiles");
      } catch (uploadErr) {
        console.error("Staff image upload failed:", uploadErr);
      }
    }

    const newStaff = await prisma.staff.create({
      data: { name, role: role || null, specialty: specialty || null, imageUrl },
    });

    res.status(201).json({ success: true, data: newStaff });
  } catch (error) {
    console.error("Add staff error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Error adding staff" });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, specialty } = req.body;

    const updateData = {
      name,
      role: role || null,
      specialty: specialty || null,
    };

    if (req.file) {
      try {
        updateData.imageUrl = await uploadToCloudinary(
          req.file.buffer,
          "image",
          "staff_profiles"
        );
      } catch (uploadErr) {
        console.error("Staff image upload failed on update:", uploadErr);
      }
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    await prisma.staff.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Staff removed" });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};