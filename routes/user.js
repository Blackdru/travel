const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { verifyToken } = require('../middlewares/auth');

// All user routes require authentication
router.use(verifyToken);

// Profile routes
router.get('/profile', userController.getProfile);
router.get('/profile/basic', userController.getBasicProfile);
router.put('/profile', userController.updateProfile);

// User data routes
router.get('/orders', userController.getOrderHistory);
router.get('/reviews', userController.getUserReviews);
router.get('/activity', userController.getUserActivity);

module.exports = router;