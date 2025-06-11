const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countries');

router.get('/', countryController.getAllCountries);
router.get('/:code', countryController.getCountryByCode);
router.post('/', countryController.addCountry); // Optional: Protect this route

module.exports = router;
