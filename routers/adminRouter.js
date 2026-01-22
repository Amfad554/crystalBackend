const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store file in memory to pass to Cloudinary
const upload = multer({ storage }); // This defines the 'upload' variable you are using below

const { 
  getDashboardStats, 
  getAllStaff, 
  addStaff, 
  deleteStaff,
  getAllEquipment,
  addEquipment,
  deleteEquipment 
} = adminController;

router.get("/stats", getDashboardStats); 

router.get("/staff/all", getAllStaff);
// Now 'upload' is defined and will catch the image
router.post("/staff/add", upload.single("image"), addStaff); 
router.delete("/staff/delete/:id", deleteStaff);

router.get("/equipment/all", getAllEquipment);
router.post("/equipment/add", upload.single("image"), addEquipment);
router.delete("/equipment/delete/:id", deleteEquipment);

module.exports = router;