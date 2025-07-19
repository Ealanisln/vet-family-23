// src/lib/prismaDB.ts

import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Check if we're in build time
const isBuildTime = process.env.IS_BUILD_TIME === 'true' || 
                   (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === undefined);

// Create a function to get or create the Prisma client
function createPrismaClient(): PrismaClient {
  if (isBuildTime) {
    // During build time, create a mock client that doesn't actually connect
    console.log('Build time detected - using mock Prisma client')
    
    // Create a proxy that returns safe fallback values for all operations
    return new Proxy({} as PrismaClient, {
      get(target, prop) {
        // Handle special Prisma properties
        if (prop === '$connect' || prop === '$disconnect') {
          return async () => Promise.resolve();
        }
        
        if (prop === '$queryRaw' || prop === '$executeRaw') {
          return async () => Promise.resolve([]);
        }
        
        if (prop === '$transaction') {
          return async (fn: Function | unknown[]) => {
            if (typeof fn === 'function') {
              return fn(new Proxy({}, { get: () => async () => null }));
            }
            return [];
          };
        }
        
        // For model operations (user, pet, etc.)
        if (typeof prop === 'string') {
          return new Proxy({}, {
            get(modelTarget, operation) {
              // Return safe fallback functions for all operations
              return async () => {
                console.log(`Build time: Mocking ${String(prop)}.${String(operation)}`);
                
                // Return appropriate fallback based on operation
                if (String(operation).includes('count')) return 0;
                if (String(operation).includes('findMany')) return [];
                if (String(operation).includes('findFirst') || String(operation).includes('findUnique')) return null;
                return null;
              };
            }
          });
        }
        
        return target[prop as keyof PrismaClient];
      }
    });
  }
  
  return new PrismaClient({
    log: ['warn', 'error'],
  })
}

// Initialize Prisma client with lazy loading
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper function to safely use Prisma during build
export async function safePrismaOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    // If it's build time, always return fallback
    if (isBuildTime) {
      console.log('Build time detected - returning fallback value')
      return fallback;
    }
    
    return await operation()
  } catch (error) {
    // During build time, return fallback value
    if (error instanceof Error && error.message.includes('did not initialize yet')) {
      console.warn('Prisma operation failed during build, using fallback')
      return fallback
    }
    throw error
  }
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