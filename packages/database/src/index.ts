// Database package - Prisma client and database access layer
// All schema changes and migrations managed here

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };
export * from '@prisma/client';
export const DATABASE_VERSION = '0.0.0';
