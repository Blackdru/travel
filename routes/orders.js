const express = require('express');
const router = express.Router();
const orders = require('../controllers/orders');
const { verifyToken } = require('../middlewares/auth');

// All order routes require authentication
router.use(verifyToken);

router.post('/', orders.createOrder);
router.get('/', orders.getOrders);
router.get('/:id', orders.getOrderById);
router.get('/user/:userId', orders.getUserOrders);

module.exports = router;