const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Use destructuring to pull the functions out of the controller object
const { 
  getDashboardStats, 
  getAllStaff, 
  addStaff, 
  deleteStaff,
  getAllEquipment,
  addEquipment,
  deleteEquipment 
} = adminController;

// LINE 17: Ensure getDashboardStats is actually defined
router.get("/stats", getDashboardStats); 

router.get("/staff/all", getAllStaff);
router.post("/staff/add", addStaff);
router.delete("/staff/delete/:id", deleteStaff);

router.get("/equipment/all", getAllEquipment);
router.post("/equipment/add", addEquipment);
router.delete("/equipment/delete/:id", deleteEquipment);

module.exports = router;