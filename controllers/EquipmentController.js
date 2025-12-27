const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching equipment" });
  }
};

exports.addEquipment = async (req, res) => {
  const { name, category, brand, region, dailyRate, description } = req.body;
  try {
    const newItem = await prisma.equipment.create({
      data: {
        name,
        category,
        brand,
        region,
        dailyRate: dailyRate ? parseFloat(dailyRate) : null,
        description,
        isAvailable: true
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add equipment" });
  }
};