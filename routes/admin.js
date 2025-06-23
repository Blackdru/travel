const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const adminController = require('../controllers/admin');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Apply authentication middleware to all admin routes
router.use(verifyToken);
router.use(requireRole(['ADMIN']));

// ===== EXISTING ADMIN ROUTES =====
router.delete('/user/:id', adminController.deleteUser);
router.delete('/product/:id', adminController.deleteProduct);

// ===== USER MANAGEMENT ROUTES =====
// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlist: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.params.id },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        },
        reviews: {
          include: {
            product: true
          }
        },
        wishlist: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user role
router.put('/users/:id', async (req, res) => {
  const { role } = req.body;
  
  // Validate role
  if (!['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be USER or ADMIN' });
  }
  
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (alternative route)
router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ===== PRODUCT MANAGEMENT ROUTES =====
// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        countries: true,
        seasons: true,
        _count: {
          select: {
            orderItems: true,
            reviews: true,
            wishlist: true
          }
        }
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ 
      where: { id: req.params.id },
      include: {
        category: true,
        countries: true,
        seasons: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                createdAt: true,
                userId: true
              }
            }
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  const { 
    name, 
    description, 
    imageUrl, 
    price, 
    availableSizes, 
    gender, 
    categoryId, 
    deliveryType, 
    type,
    countryIds, // array of country IDs
    seasonIds   // array of season IDs
  } = req.body;
  
  try {
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(imageUrl && { imageUrl }),
        ...(price && { price: parseFloat(price) }),
        ...(availableSizes && { availableSizes }),
        ...(gender && { gender }),
        ...(categoryId && { categoryId }),
        ...(deliveryType && { deliveryType }),
        ...(type && { type }),
        // Update countries relationship
        ...(countryIds && {
          countries: {
            set: [], // Clear existing relationships
            connect: countryIds.map(id => ({ id }))
          }
        }),
        // Update seasons relationship
        ...(seasonIds && {
          seasons: {
            set: [], // Clear existing relationships
            connect: seasonIds.map(id => ({ id }))
          }
        })
      },
      include: {
        category: true,
        countries: true,
        seasons: true
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Failed to update product:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (alternative route)
router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ===== ORDER MANAGEMENT ROUTES =====
// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ 
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
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
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
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Delete order
router.delete('/orders/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Failed to delete order:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// ===== REVIEW MANAGEMENT ROUTES =====
// Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({ 
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }, 
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get review by ID
router.get('/reviews/:id', async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }, 
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Failed to fetch review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Delete review
router.delete('/reviews/:id', async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Failed to delete review:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ===== ANALYTICS & METRICS ROUTES =====
// Get system metrics
router.get('/metrics', async (req, res) => {
  try {
    const [countries, products, orders, users, reviews, categories, seasons] = await Promise.all([
      prisma.country.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.category.count(),
      prisma.season.count(),
    ]);
    
    // Get additional metrics
    const totalRevenue = await prisma.orderItem.aggregate({
      _sum: {
        price: true
      }
    });
    
    const averageOrderValue = await prisma.order.findMany({
      include: {
        orderItems: true
      }
    }).then(orders => {
      if (orders.length === 0) return 0;
      const totalValue = orders.reduce((sum, order) => {
        const orderValue = order.orderItems.reduce((orderSum, item) => {
          return orderSum + (item.price * item.quantity);
        }, 0);
        return sum + orderValue;
      }, 0);
      return totalValue / orders.length;
    });
    
    res.json({ 
      countries, 
      products, 
      orders, 
      users, 
      reviews, 
      categories, 
      seasons,
      totalRevenue: totalRevenue._sum.price || 0,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get user statistics
router.get('/stats/users', async (req, res) => {
  try {
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });
    
    const recentUsers = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    res.json({
      roleDistribution: userStats,
      recentUsers
    });
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get order statistics
router.get('/stats/orders', async (req, res) => {
  try {
    const orderStats = await prisma.order.groupBy({
      by: ['deliveryType'],
      _count: {
        id: true
      }
    });
    
    // Get orders by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true,
        orderItems: {
          select: {
            price: true,
            quantity: true
          }
        }
      }
    });
    
    res.json({
      deliveryTypeDistribution: orderStats,
      monthlyOrders: monthlyOrders.map(order => ({
        date: order.createdAt,
        value: order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }))
    });
  } catch (error) {
    console.error('Failed to fetch order stats:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

module.exports = router;