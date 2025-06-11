const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { verifyToken, requireRole } = require('../middleware/auth');

// Only ADMIN can access
router.delete('/user/:id', verifyToken, requireRole(['ADMIN']), adminController.deleteUser);
router.delete('/product/:id', verifyToken, requireRole(['ADMIN']), adminController.deleteProduct);

module.exports = router;
