const express = require('express');
const router = express.Router();
const categories = require('../controllers/categories');

// Public routes
router.get('/', categories.getCategories);
router.get('/:id', categories.getCategoryById);

// Protected routes (require authentication)
router.post('/', categories.createCategory);
router.put('/:id', categories.updateCategory);
router.delete('/:id', categories.deleteCategory);

module.exports = router;
