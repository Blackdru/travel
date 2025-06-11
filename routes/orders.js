const express = require('express');
const router = express.Router();
const orders = require('../controllers/orders');

router.post('/', orders.createOrder);
router.get('/', orders.getOrders);

module.exports = router;
