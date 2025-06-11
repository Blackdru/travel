const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new season
exports.createSeason = async (req, res) => {
  const { name, monthFrom, monthTo, countryId } = req.body;
  try {
    const season = await prisma.season.create({
      data: { name, monthFrom, monthTo, countryId }
    });
    res.status(201).json(season);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create season', details: err.message });
  }
};

// Get all seasons for a country
exports.getSeasonsByCountry = async (req, res) => {
  const { countryId } = req.params;
  try {
    const seasons = await prisma.season.findMany({
      where: { countryId }
    });
    res.json(seasons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
};

// Get current season by country
exports.getCurrentSeason = async (req, res) => {
  const { countryId } = req.params;
  const currentMonth = new Date().getMonth() + 1;

  try {
    const season = await prisma.season.findFirst({
      where: {
        countryId,
        monthFrom: { lte: currentMonth },
        monthTo: { gte: currentMonth }
      }
    });

    if (!season) {
      return res.status(404).json({ message: 'No season found for this month' });
    }

    res.json(season);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get current season' });
  }
};
