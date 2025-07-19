// src/lib/prismaDB.ts

import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Initialize Prisma with error handling for build time
let prismaInstance: PrismaClient | undefined;

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} catch (error) {
  // During build time, Prisma might not initialize properly
  // This is expected and we'll handle it gracefully
  console.warn('Prisma initialization warning during build:', error);
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: ['warn', 'error'],
  });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export the connection test function to be used when needed
export async function testConnection() {
  try {
    // Test query to verify connection
    await prisma.$queryRaw`SELECT 1`
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    return false
  }
}