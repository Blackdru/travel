const express = require('express');
const router = express.Router();
const categories = require('../controllers/categories');

router.post('/', categories.createCategory);
router.get('/', categories.getCategories); // ?countryId=&seasonId=&gender=

module.exports = router;
