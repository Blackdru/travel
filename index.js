const express = require('express');
const app = express();
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/countries', require('./routes/countries'));
app.use('/seasons', require('./routes/seasons'));
app.use('/categories', require('./routes/categories'));
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));
app.use('/reviews', require('./routes/reviews'));
app.use('/wishlist', require('./routes/wishlist'));
app.use('/trending', require('./routes/trending'));
app.use('/recommendations', require('./routes/recommendations'));
app.use('/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth'));
app.use('/external', require("./routes/external"));


app.get('/test', async (req, res) => {

async function main() {
  // Loading country seasons from file
  const countrySeasons = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'countries_seasons_with_codes.json'), 'utf-8')
  );

  for (const country of countrySeasons) {
    // Check if Country already exists in your DB
    const existingCountry = await prisma.country.findUnique({ where: { id: country.id } });

    if (!existingCountry) {
      console.warn(`Country with id ${country.id} not found in the database.`);
      continue;
    }
  
    // Prepare Season data
    const seasonData = country.seasons?.map(s => ({
      countryId: country.id,
      season: s.season,
      start: s.start,
      end: s.end
    }));

    if (seasonData && seasonData.length > 0) {
      // create many at once
      await prisma.season.createMany({ data: seasonData });
      console.log(`Added ${seasonData.length} seasons for ${existingCountry.name}.`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Done populating seasons');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

});




app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
