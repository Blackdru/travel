const express = require('express');
const router = express.Router();
const controller = require('../controllers/recommendations');

router.post('/track', controller.trackView);
router.get('/recent/:userId', controller.getRecentlyViewed);
router.get('/smart/:userId', controller.getRecommendations);

module.exports = router;
