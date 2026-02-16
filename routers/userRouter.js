const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isUser } = require('../middlewares/auth'); // Use your existing middleware
const upload = require('../middlewares/uploads'); // Use your existing multer

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/verifyemail/:token', userController.verifyEmail);
router.get('/verifyemail/:token', userController.verifyEmail);

// Protected routes - using your existing isUser middleware
router.put('/update-profile/:id', isUser, upload.single('profileImage'), userController.updateProfile);
router.get('/all', isUser, userController.getAllUsers);
router.delete('/delete/:id', isUser, userController.deleteUser);
router.put('/update-role/:id', isUser, userController.updateRole);

// Newsletter routes
router.post('/newsletter', userController.subscribeNewsletter);
router.get('/newsletter-all', userController.getAllSubscribers);

// Application routes
router.post('/apply', userController.applyForJob);
router.get('/applications/all', userController.getAllApplications);

module.exports = router;