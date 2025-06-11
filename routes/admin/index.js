const express = require('express');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin');

router.use(isAdmin);

router.use('/users', require('./users'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));
router.use('/reviews', require('./reviews'));

router.get('/metrics', async (req, res) => {
  const prisma = new (require('@prisma/client').PrismaClient)();
  const [countries, products, orders, users, reviews] = await Promise.all([
    prisma.country.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.review.count(),
  ]);
  res.json({ countries, products, orders, users, reviews });
});

module.exports = router;
