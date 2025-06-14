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
  
  // Input validation
  if (!userId || !deliveryType || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'userId, deliveryType, and items are required' });
  }
  
  if (deliveryType === 'HOME' && !shippingAddress) {
    return res.status(400).json({ error: 'shippingAddress is required for HOME delivery' });
  }
  
  if (deliveryType === 'ON_ARRIVAL' && (!arrivalCountry || !arrivalAirport)) {
    return res.status(400).json({ error: 'arrivalCountry and arrivalAirport are required for ON_ARRIVAL delivery' });
  }
  
  try {
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      
      const quantity = item.quantity || 1;
      if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than 0' });
      }
      
      totalPrice += product.price * quantity;
      
      orderItemsData.push({
        productId: item.productId,
        quantity,
        price: product.price
      });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        deliveryType,
        shippingAddress: deliveryType === "HOME" ? shippingAddress : null,
        arrivalCountry: deliveryType === "ON_ARRIVAL" ? arrivalCountry : null,
        arrivalAirport: deliveryType === "ON_ARRIVAL" ? arrivalAirport : null,
        totalPrice, // Add total price to order
        orderItems: {
          create: orderItemsData
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
};

// Fetch orders (with optional user filtering)
exports.getOrders = async (req, res) => {
  const { userId } = req.query;
  
  try {
    const orders = await prisma.order.findMany({
      where: userId ? { userId } : {},
      include: { 
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Get orders for a specific user
exports.getUserOrders = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { 
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(orders);
  } catch (err) {
    console.error('User orders fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
};