const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  getAllEquipment, 
  addEquipment, 
  updateEquipment, 
  deleteEquipment 
} = require('../controllers/EquipmentController');

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

// Routes
router.get('/all', getAllEquipment);
router.post('/add', upload.single('image'), addEquipment);
router.put('/update/:id', upload.single('image'), updateEquipment);
router.delete('/delete/:id', deleteEquipment);

module.exports = router;