const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  const userId = req.headers['x-user-id']; // Expecting admin’s user ID in headers

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  req.user = user;
  next();
};
