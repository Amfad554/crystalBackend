const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  getDashboardStats,
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
} = adminController;

// ── Stats ──────────────────────────────
router.get("/stats", getDashboardStats);

// ── Equipment ──────────────────────────
router.get("/equipment/all", getAllEquipment);
router.post("/equipment/add", upload.single("image"), addEquipment);
router.put("/equipment/update/:id", upload.single("image"), updateEquipment); // ← was missing
router.delete("/equipment/delete/:id", deleteEquipment);

// ── Staff ──────────────────────────────
router.get("/staff/all", getAllStaff);
router.post("/staff/add", upload.single("image"), addStaff);
router.put("/staff/update/:id", upload.single("image"), updateStaff);         // ← was missing
router.delete("/staff/delete/:id", deleteStaff);

module.exports = router;