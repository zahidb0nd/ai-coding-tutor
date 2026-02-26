const { PrismaClient } = require('@prisma/client');

// Singleton pattern — reuse Prisma connection across the app
const prisma = new PrismaClient();

module.exports = prisma;
