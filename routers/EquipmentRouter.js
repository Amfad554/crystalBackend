const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  getAllEquipment, 
  addEquipment, 
  updateEquipment, 
  deleteEquipment 
} = require('../controllers/EquipmentController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// PUBLIC ROUTE - Anyone can view equipment (for catalogue page)
router.get('/all', getAllEquipment);

// PROTECTED ROUTES - Only authenticated admins can modify
router.post('/add', verifyToken, upload.single('image'), addEquipment);
router.put('/update/:id', verifyToken, upload.single('image'), updateEquipment);
router.delete('/delete/:id', verifyToken, deleteEquipment);

module.exports = router;