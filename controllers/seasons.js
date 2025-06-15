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
    const seasons = await prisma.season.findMany({ where: { countryId } });

    // Get today's date
    const today = new Date();
    const currentMonth = today.toLocaleString('en', { month: 'long' });

    // Define a helper to convert a month name to a number (Jan = 0, Feb = 1 etc.)
    const months = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ];

    const currentIdx = months.indexOf(currentMonth);

    // Determine which season covers this currentIdx
    let currentSeason = null;
    for (const season of seasons) {
      const startIdx = months.indexOf(season.start);
      const endIdx = months.indexOf(season.end);

      // Handle cases where the season might wrap past December
      if (startIdx <= endIdx) {
        if (currentIdx >= startIdx && currentIdx <= endIdx) {
          currentSeason = season;
          break;
        }
      } else { 
        // Season crosses December (like Winter in many hemispheres, December to February).
        if (currentIdx >= startIdx || currentIdx <= endIdx) {
          currentSeason = season;
          break;
        }
      }
    }

    res.json({ seasons, currentSeason });
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
