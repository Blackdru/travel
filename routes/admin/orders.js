const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({ include: { orderItems: true } });
  res.json(orders);
});

router.get('/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { orderItems: true },
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.delete('/:id', async (req, res) => {
  await prisma.order.delete({ where: { id: req.params.id } });
  res.json({ message: 'Order deleted' });
});

module.exports = router;
