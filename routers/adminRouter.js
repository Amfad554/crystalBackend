const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const upload = require("../utils/uploadToCloudinary");

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
// ADDED: upload.single("image") middleware here
router.post("/staff/add", upload.single("image"), addStaff); 
router.delete("/staff/delete/:id", deleteStaff);

router.get("/equipment/all", getAllEquipment);
// ADDED: upload.single("image") middleware here
router.post("/equipment/add", upload.single("image"), addEquipment);
router.delete("/equipment/delete/:id", deleteEquipment);

module.exports = router;