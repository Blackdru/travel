const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews');

router.post('/', reviewsController.createReview);
router.get('/:productId', reviewsController.getProductReviews);
router.get('/average/:productId', reviewsController.getAverageRating);

module.exports = router;
