const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
  const {
    userId = "demo-user", // Replace later with actual auth system
    deliveryType,
    shippingAddress,
    arrivalCountry,
    arrivalAirport,
    items // [{ productId, quantity }]
  } = req.body;

  try {
    const order = await prisma.order.create({
      data: {
        userId,
        deliveryType,
        shippingAddress: deliveryType === "HOME" ? shippingAddress : null,
        arrivalCountry: deliveryType === "ON_ARRIVAL" ? arrivalCountry : null,
        arrivalAirport: deliveryType === "ON_ARRIVAL" ? arrivalAirport : null,
        orderItems: {
          create: items.map((item) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity || 1
          }))
        }
      },
      include: {
        orderItems: true
      }
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
};

// Fetch orders (simple for now)
exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { orderItems: true }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
