const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a product
exports.createProduct = async (req, res) => {
  const { name, description, imageUrl, price, availableSizes, gender, categoryId, deliveryType } = req.body;

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
        deliveryType
      }
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
};

// Get products with filters
exports.getProducts = async (req, res) => {
  const { categoryId, gender, deliveryType } = req.query;

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(gender && { gender }),
        ...(deliveryType && { deliveryType }),
      }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
