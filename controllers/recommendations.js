const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Record viewed product
exports.trackView = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    await prisma.userActivity.create({
      data: { userId, productId }
    });
    res.status(200).json({ message: 'Tracked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track activity' });
  }
};

// Get recently viewed
exports.getRecentlyViewed = async (req, res) => {
  const { userId } = req.params;

  try {
    const views = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 10,
      include: { product: true }
    });

    res.json(views.map(v => v.product));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// Get smart recommendations
exports.getRecommendations = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          include: { orderItems: { include: { product: true } } }
        },
        wishlist: true,
      },
    });

    const productIds = [
      ...new Set([
        ...user.orders.flatMap(o => o.orderItems.map(i => i.productId)),
        ...user.wishlist.map(w => w.productId),
      ]),
    ];

    const recommendations = await prisma.product.findMany({
      where: {
        id: { notIn: productIds },
        gender: 'MALE', // use user.gender if available
      },
      take: 10,
    });

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};
