const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Replace middlewares/isAdmin.js with this unified approach
const { verifyToken, requireRole } = require('./auth');

module.exports = (req, res, next) => {
  // First verify JWT token
  verifyToken(req, res, (err) => {
    if (err) return;
    
    // Then check admin role
    requireRole(['ADMIN'])(req, res, next);
  });
};