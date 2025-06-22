const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user profile with comprehensive details
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // Include related data for comprehensive profile
        orders: {
          select: {
            id: true,
            deliveryType: true,
            createdAt: true,
            orderItems: {
              select: {
                quantity: true,
                product: {
                  select: {
                    name: true,
                    price: true,
                    imageUrl: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Get last 5 orders
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Get last 5 reviews
        },
        wishlist: {
          select: {
            id: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                gender: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlist: true,
            useractivity: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate total spent
    const totalSpent = user.orders.reduce((total, order) => {
      return total + order.orderItems.reduce((orderTotal, item) => {
        return orderTotal + (item.product.price * item.quantity);
      }, 0);
    }, 0);
    
    // Add computed fields
    const profileData = {
      ...user,
      stats: {
        totalOrders: user._count.orders,
        totalReviews: user._count.reviews,
        wishlistItems: user._count.wishlist,
        totalSpent: totalSpent,
        productsViewed: user._count.useractivity
      }
    };
    
    res.json(profileData);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
};

// Get basic user profile (lightweight version)
exports.getBasicProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Basic profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch basic profile', details: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.userId;
  
  try {
    // If email is being updated, check if it's already taken
    if (email) {
      const existingUser = await prisma.user.findUnique({ 
        where: { email }
      });
      
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
};

// Get user's order history
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                gender: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    const totalOrders = await prisma.order.count({
      where: { userId }
    });
    
    res.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (err) {
    console.error('Order history fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch order history', details: err.message });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    const totalReviews = await prisma.review.count({
      where: { userId }
    });
    
    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit)
      }
    });
  } catch (err) {
    console.error('User reviews fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch user reviews', details: err.message });
  }
};

// Get user's activity (recently viewed products)
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
            gender: true
          }
        }
      },
      orderBy: {
        viewedAt: 'desc'
      },
      skip,
      take: limit
    });
    
    const totalActivities = await prisma.userActivity.count({
      where: { userId }
    });
    
    res.json({
      activities,
      pagination: {
        page,
        limit,
        total: totalActivities,
        pages: Math.ceil(totalActivities / limit)
      }
    });
  } catch (err) {
    console.error('User activity fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch user activity', details: err.message });
  }
};