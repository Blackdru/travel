const express = require('express');
const router = express.Router();
const trendingController = require('../controllers/trending');

router.get('/global', trendingController.getTrendingGlobal);
router.get('/country/:countryId', trendingController.getTrendingByCountry);

module.exports = router;
