const express = require('express');
const { addEquipment } = require('../controllers/EquipmentController');
const router = express.Router();

router.get('/all', addEquipment.getAllEquipment);
router.post('/add', addEquipment.addEquipment);

module.exports = router;