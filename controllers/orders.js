const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
  const {
    userId, 
    deliveryType,
    shippingAddress,
    arrivalCountry,
    arrivalAirport,
    items // [{ productId, quantity }]
  } = req.body;
  
const productIds = items.map(item => item.productId);
const products = await prisma.product.findMany({
  where: { id: { in: productIds } }
});

let totalPrice = 0;
const orderItemsData = items.map(item => {
  const product = products.find(p => p.id === item.productId);
  if (!product) throw new Error(`Product ${item.productId} not found`);
  
  const quantity = item.quantity || 1;
  totalPrice += product.price * quantity;
  
  return {
    productId: item.productId,
    quantity,
    price: product.price
  };
});

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
