const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a category
exports.createCategory = async (req, res) => {
  const { name, gender, countryId, seasonId } = req.body;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        gender,
        countryId,
        seasonId
      }
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
};

// Get all categories for a season and country
exports.getCategories = async (req, res) => {
  const { countryId, seasonId, gender } = req.query;

  try {
    const categories = await prisma.category.findMany({
      where: {
        countryId,
        seasonId,
        ...(gender && { gender }) // optional filter
      }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
