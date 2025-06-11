const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create review
exports.createReview = async (req, res) => {
  const { productId, rating, comment, userId } = req.body;

  try {
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        productId
      }
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review', details: err.message });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: true }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get average rating
exports.getAverageRating = async (req, res) => {
  const { productId } = req.params;

  try {
    const result = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { productId }
    });
    res.json({ averageRating: result._avg.rating || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate average rating' });
  }
};
