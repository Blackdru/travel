const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    imageUrl,
    price,
    availableSizes,
    gender,
    categoryId,
    deliveryType,
    type,
    countryIds, // array of country IDs
    seasonIds   // array of season IDs
  } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        imageUrl,
        price,
        availableSizes,
        gender,
        categoryId,
        deliveryType,
        type,
        countries: {
          connect: countryIds?.map(id => ({ id }))
        },
        seasons: {
          connect: seasonIds?.map(id => ({ id }))
        }
      },
      include: {
        countries: true,
        seasons: true
      }
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
};


// Get products with filters
exports.getProducts = async (req, res) => {
  const { categoryId, gender, deliveryType, countryId, seasonId, type } = req.query;

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(gender && { gender }),
        ...(deliveryType && { deliveryType }),
        ...(type && { type }),
        ...(countryId && {
          countries: {
            some: { id: parseInt(countryId) }
          }
        }),
        ...(seasonId && {
          seasons: {
            some: { id: parseInt(seasonId) }
          }
        })
      },
      include: {
        countries: true,
        seasons: true
      }
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};
