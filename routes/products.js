const express = require('express');
const router = express.Router();
const products = require('../controllers/products');

// Create product
router.post('/', products.createProduct);

// Get all products with filters
router.get('/', products.getProducts);

// Get a single product by ID
router.get('/:productId', products.getProductById);

module.exports = router;
