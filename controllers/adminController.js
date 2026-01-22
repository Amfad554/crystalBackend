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
    const { name, role, specialty } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "image", "staff_profiles");
    }

    const newStaff = await prisma.staff.create({
      data: {
        name,
        role,
        specialty,
        imageUrl: imageUrl,
      },
    });

    res.status(201).json({ success: true, data: newStaff });
  } catch (error) {
    console.error("🔥 Staff Add Error:", error);
    res.status(500).json({ success: false, message: "Error adding staff member" });
  }
};
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, specialty } = req.body;
    
    // Create update object
    const updateData = { name, role, specialty };
    
    // If a new image was uploaded via Cloudinary, update the URL
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
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

// --- EQUIPMENT ---
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.addEquipment = async (req, res) => {
  try {
    const { name, category, brand, region, description, dailyRate } = req.body;
    
    // 1. Upload Buffer to Cloudinary using your utility
    let imageUrl = null;
    if (req.file) {
      // Arguments: (fileBuffer, resourceType, folder_name)
      imageUrl = await uploadToCloudinary(req.file.buffer, "image", "equipment_assets");
    }

    // 2. Data Cleaning
    const parsedRate = dailyRate && dailyRate !== "" ? parseFloat(dailyRate) : null;

    // 3. Database Creation
    const newEquip = await prisma.equipment.create({
      data: {
        name: name || "Unnamed Equipment",
        category,
        brand,
        region,
        description,
        imageUrl: imageUrl, // The secure_url returned from your utility
        dailyRate: parsedRate,
      },
    });

    res.status(201).json({ success: true, data: newEquip });
  } catch (error) {
    console.error("🔥 Equipment Add Error:", error);
    res.status(500).json({ success: false, message: "Failed to add equipment." });
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