const express = require('express');
const router = express.Router();
const products = require('../controllers/products');

router.post('/', products.createProduct);
router.get('/', products.getProducts); // ?categoryId=&gender=&deliveryType=

module.exports = router;

