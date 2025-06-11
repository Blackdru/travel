const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist');

router.post('/', wishlistController.addToWishlist);
router.delete('/', wishlistController.removeFromWishlist);
router.get('/:userId', wishlistController.getWishlist);

module.exports = router;
