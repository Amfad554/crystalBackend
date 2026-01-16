const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// This matches /equipment/chat because of your app.use('/equipment', ...)
router.post('/chat', aiController.handleChat);

module.exports = router;