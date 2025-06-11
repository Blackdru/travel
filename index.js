const express = require('express');
const app = express();
const cors = require('cors');

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



app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
