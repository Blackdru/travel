const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get trending products globally
exports.getTrendingGlobal = async (req, res) => {
  try {
    const trending = await prisma.product.findMany({
      take: 10,
      orderBy: {
        orderItems: {
          _count: 'desc',
        }
      },
      include: {
        category: true,
        reviews: true
      }
    });

    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch global trending products', details: err.message });
  }
};

// Get trending products by country
exports.getTrendingByCountry = async (req, res) => {
  const { countryId } = req.params;

  try {
    const trending = await prisma.product.findMany({
      where: {
        category: {
          countryId: countryId
        }
      },
      take: 10,
      orderBy: {
        orderItems: {
          _count: 'desc',
        }
      },
      include: {
        category: true,
        reviews: true
      }
    });

    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending products by country', details: err.message });
  }
};
