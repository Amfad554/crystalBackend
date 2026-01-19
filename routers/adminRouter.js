const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// 1. Rename this one to avoid the clash
const uploadToCloudinary = require("../utils/uploadToCloudinary"); 

// 2. Keep this as 'upload' so your router.post lines work
const upload = require('../middleware/uploadMiddleware');

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
// Uses the 'upload' middleware to catch the file
router.post("/staff/add", upload.single("image"), addStaff); 
router.delete("/staff/delete/:id", deleteStaff);

router.get("/equipment/all", getAllEquipment);
// Uses the 'upload' middleware to catch the file
router.post("/equipment/add", upload.single("image"), addEquipment);
router.delete("/equipment/delete/:id", deleteEquipment);

module.exports = router;