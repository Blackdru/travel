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

  // Log incoming data for debugging
  console.log('Request body:', req.body);
  console.log('categoryId type:', typeof categoryId, 'value:', categoryId);
  console.log('countryIds:', countryIds);
  console.log('seasonIds:', seasonIds);

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
          connect: countryIds?.map(id => ({ id: String(id) }))
        },
        seasons: {
          connect: seasonIds?.map(id => ({ id: String(id) }))
        }
      },
      include: {
        category: true,
        countries: true,
        seasons: true
      }
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
};


// Get products with filters
exports.getProducts = async (req, res) => {
  const { categoryId, gender, deliveryType, countryId, seasonId, type } = req.query;

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(gender && { gender }),
        ...(deliveryType && { deliveryType }),
        ...(type && { type }),
        ...(countryId && {
          countries: {
            some: { id: countryId }
          }
        }),
        ...(seasonId && {
          seasons: {
            some: { id: seasonId }
          }
        })
      },
      include: {
        category: true,
        countries: true,
        seasons: true
      }
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};
