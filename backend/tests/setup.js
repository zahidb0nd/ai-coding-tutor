import { beforeAll, afterAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Setup global test constraints
beforeAll(async () => {
    // If we wanted an isolated DB we would connect to it here based on ENV var
});

afterAll(async () => {
    await prisma.$disconnect();
});

// A helper to clear DB for tests that need it
export const clearDatabase = async () => {
    // Dangerous, don't drop everything arbitrarily unless in test DB
    // await prisma.submission.deleteMany({});
    // await prisma.challenge.deleteMany({});
    // await prisma.user.deleteMany({});
};
