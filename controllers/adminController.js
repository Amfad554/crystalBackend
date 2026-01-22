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
    // 1. Pull text fields from req.body
    const { name, role, specialty } = req.body;
    
    // 2. Pull the Cloudinary URL from req.file
    const imageUrl = req.file ? req.file.path : null;

    const newStaff = await prisma.staff.create({
      data: {
        name,
        role,
        specialty,
        imageUrl: imageUrl, // Saving the link as a string
      },
    });

    res.status(201).json({ success: true, data: newStaff });
  } catch (error) {
    console.error("Staff Add Error:", error);
    res.status(500).json({ success: false, message: "Error adding staff" });
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
exports.addEquipment = async (req, res) => {
  try {
    const { name, category, brand, region, description, dailyRate } = req.body;
    
    // 1. Handle the Image URL from Multer/Cloudinary
    const imageUrl = req.file ? req.file.path : null;

    // 2. Data Cleaning & Parsing
    // dailyRate comes as a string from FormData; Prisma needs a Float/Number
    const parsedRate = dailyRate && dailyRate !== "" ? parseFloat(dailyRate) : null;

    // 3. Database Creation
    const newEquip = await prisma.equipment.create({
      data: {
        name: name || "Unnamed Equipment",
        category: category || "General",
        brand: brand || "N/A",
        region: region || "Lagos",
        description: description || "",
        imageUrl: imageUrl,
        dailyRate: parsedRate, // Now safely a Number or null
      },
    });

    res.status(201).json({ 
      success: true, 
      message: "Equipment added successfully", 
      data: newEquip 
    });
  } catch (error) {
    console.error("🔥 Equipment Add Error:", error);
    
    // Check for specific Prisma errors (e.g., missing required fields)
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: "Equipment already exists." });
    }

    res.status(500).json({ 
      success: false, 
      message: "Failed to add equipment. Check server logs." 
    });
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