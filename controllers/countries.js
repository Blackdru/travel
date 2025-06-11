const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCountries = async (req, res) => {
  try {
    const countries = await prisma.country.findMany();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

exports.getCountryByCode = async (req, res) => {
  const code = req.params.code.toUpperCase();
  try {
    const country = await prisma.country.findUnique({ where: { code } });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    res.json(country);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch country' });
  }
};

exports.addCountry = async (req, res) => {
  const { name, code, flagUrl, timezone } = req.body;
  try {
    const newCountry = await prisma.country.create({
      data: { name, code, flagUrl, timezone }
    });
    res.status(201).json(newCountry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add country' });
  }
};
