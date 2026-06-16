import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern to avoid multiple instances in development
const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}

export { prisma };
export type { PrismaClient };
export * from '@prisma/client';
