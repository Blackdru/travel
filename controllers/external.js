const fetch = require('node-fetch'); // make sure to `npm install node-fetch@2`

exports.fetchAllCountries = async (req, res) => { 
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,capital,flags');
    if (!response.ok) {
      throw new Error('API responded with ' + response.status);
    }
    const countries = await response.json();

    if (!Array.isArray(countries)) {
      console.log('API did not return an array!', countries);
      return res.status(500).json({ error: 'Invalid API response format' });
    }
  
    const simplified = countries.map(country => ({
      name: country?.name?.common,
      code: country?.cca2,
      region: country?.region,
      capital: Array.isArray(country?.capital) ? country?.capital[0] : '',
      flag: country?.flags?.png,
    }));

    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch countries', details: err?.message });
  }
};



// 2️⃣ Fetch products from fake store API
exports.fetchProducts = async (req, res) => {
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err?.message });
  }
};

// 3️⃣ Determine current season based on the current date
exports.getCurrentSeason = (req, res) => {
  const month = new Date().getMonth() + 1;
  let season;

  if (month >= 3 && month <= 5) {
    season = 'Spring';
  } else if (month >= 6 && month <= 8) {
    season = 'Summer';
  } else if (month >= 9 && month <= 11) {
    season = 'Autumn';
  } else {
    season = 'Winter';
  }
  
  res.json({ season });
};

