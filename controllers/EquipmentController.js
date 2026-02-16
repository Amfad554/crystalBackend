const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform imageUrl to full URL
    const equipmentWithFullUrls = equipment.map(item => ({
      ...item,
      imageUrl: item.imageUrl ? `${process.env.BACKEND_URL || 'https://crystalbackend.onrender.com'}${item.imageUrl}` : null
    }));
    
    res.status(200).json({ success: true, data: equipmentWithFullUrls });
  } catch (error) {
    console.error("Get Equipment Error:", error);
    res.status(500).json({ success: false, message: "Error fetching equipment" });
  }
};

exports.addEquipment = async (req, res) => {
  try {
    const { name, category, brand, region, dailyRate, description } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and category are required" 
      });
    }

    // Handle image upload
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newItem = await prisma.equipment.create({
      data: {
        name,
        category,
        brand: brand || null,
        region: region || "Lagos",
        dailyRate: dailyRate ? parseFloat(dailyRate) : null,
        description: description || null,
        imageUrl,
        isAvailable: true
      }
    });
    
    // Return with full URL
    const response = {
      ...newItem,
      imageUrl: newItem.imageUrl ? `${process.env.BACKEND_URL || 'https://crystalbackend.onrender.com'}${newItem.imageUrl}` : null
    };
    
    res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.error("Add Equipment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to add equipment" 
    });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, brand, region, dailyRate, description } = req.body;
    
    // Handle image upload if new file provided
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData = {
      name,
      category,
      brand,
      region,
      dailyRate: dailyRate ? parseFloat(dailyRate) : null,
      description
    };

    // Only update imageUrl if a new file was uploaded
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const updated = await prisma.equipment.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Return with full URL
    const response = {
      ...updated,
      imageUrl: updated.imageUrl ? `${process.env.BACKEND_URL || 'https://crystalbackend.onrender.com'}${updated.imageUrl}` : null
    };

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Update Equipment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to update equipment" 
    });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.equipment.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ success: true, message: "Equipment deleted" });
  } catch (error) {
    console.error("Delete Equipment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete equipment" 
    });
  }
};