const express = require('express');
const router = express.Router();
const seasons = require('../controllers/seasons');

router.post('/', seasons.createSeason);                        // Add new season
router.get('/:countryId', seasons.getSeasonsByCountry);        // Get all seasons for country
router.get('/current/:countryId', seasons.getCurrentSeason);   // Get current season

module.exports = router;
