import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [],
    datasourceUrl: process.env.DATABASE_URL,
  });

// Toujours réutiliser le même client (dev + prod)
globalForPrisma.prisma = prisma;