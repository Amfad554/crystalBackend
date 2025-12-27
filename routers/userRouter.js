// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// --- AUTH ROUTES ---
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/verifyemail', userController.verifyEmail);

// --- ADMIN/USER MANAGEMENT ---
router.get('/all', userController.getAllUsers);
router.delete('/delete/:id', userController.deleteUser);
router.put('/update-role/:id', userController.updateRole);

// --- PROFILE ROUTES ---
router.put('/update-profile/:id', userController.updateProfile);

// --- NEWSLETTER ROUTES ---
// For the frontend "News" component to join
router.post('/newsletter-subscribe', userController.subscribeNewsletter);

// ADDED: For the Dashboard to display all subscribers
// This matches your dashboard fetch: http://localhost:5000/api/users/newsletter-all
router.get('/newsletter-all', userController.getAllSubscribers);

// ... other routes
router.post('/careers/apply', userController.applyForJob);

router.get('/applications/all', userController.getAllApplications);

module.exports = router;