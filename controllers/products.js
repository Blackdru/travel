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

exports.getProducts = async (req, res) => {
  let { categoryId, gender, deliveryType, countryId, seasonId, type } = req.query;

  try {
    // Clean invalid query params
    categoryId = typeof categoryId === 'string' && categoryId.trim() !== '' ? categoryId : undefined;
    gender = typeof gender === 'string' && gender.trim() !== '' ? gender : undefined;
    deliveryType = typeof deliveryType === 'string' && deliveryType.trim() !== '' ? deliveryType : undefined;
    type = typeof type === 'string' && type.trim() !== '' ? type : undefined;
    countryId = typeof countryId === 'string' && countryId.trim() !== '' ? countryId : undefined;
    seasonId = typeof seasonId === 'string' && seasonId.trim() !== '' ? seasonId : undefined;

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
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};


exports.getProductById = async (req, res) => {
  const { productId } = req.params;

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        countries: true,
        seasons: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
};