import { PrismaClient } from '@prisma/client'
import { prisma as mockPrisma } from './mock-db'

let prismaInstance: any;

// Use mock database during build time
if (typeof process !== 'undefined' && 
    process.env.NODE_ENV === 'production' && 
    process.env.NEXT_PHASE === 'phase-production-build') {
  console.log('Using mock database during build');
  prismaInstance = mockPrisma;
} else {
  const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };
  
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: ['error', 'warn']
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;


