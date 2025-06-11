const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const existing = await prisma.wishlist.findFirst({
      where: { userId, productId }
    });

    if (existing) {
      return res.status(409).json({ message: 'Already in wishlist' });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: { userId, productId }
    });

    res.status(201).json(wishlistItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to wishlist', details: err.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    await prisma.wishlist.deleteMany({
      where: { userId, productId }
    });

    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist', details: err.message });
  }
};

// Get wishlist for a user
exports.getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true }
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist', details: err.message });
  }
};
