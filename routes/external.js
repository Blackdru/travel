const express = require('express');
const router = express.Router();

const external = require('../controllers/external');

router.get('/countries', external.fetchAllCountries);
router.get('/products', external.fetchProducts);
router.get('/season', external.getCurrentSeason);

module.exports = router;
