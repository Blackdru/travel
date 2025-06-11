const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const reviews = await prisma.review.findMany({ include: { user: true, product: true } });
  res.json(reviews);
});

router.delete('/:id', async (req, res) => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ message: 'Review deleted' });
});

module.exports = router;
