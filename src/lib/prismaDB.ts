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
                   (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) ||
                   typeof window !== 'undefined'; // Client-side

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
  
  // In runtime, create the actual Prisma client
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
}

// Global Prisma client variable (initially undefined for lazy initialization)
let _prismaClient: PrismaClient | undefined;

// Lazy initialization function
function initializePrisma(): PrismaClient {
  // Return existing client if already initialized
  if (_prismaClient) {
    return _prismaClient;
  }

  try {
    if (process.env.NODE_ENV === 'production') {
      // In production, always create a new instance
      _prismaClient = createPrismaClient();
    } else {
      // In development, use a global variable to preserve the Prisma client across module reloads
      if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrismaClient();
      }
      _prismaClient = globalForPrisma.prisma;
    }
    
    return _prismaClient;
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    
    // Create a fallback mock client for error cases
    const fallbackClient = new Proxy({} as PrismaClient, {
      get(target, prop) {
        if (prop === '$connect' || prop === '$disconnect') {
          return async () => Promise.resolve();
        }
        
        if (prop === '$queryRaw' || prop === '$executeRaw') {
          return async () => {
            console.warn('Using fallback Prisma client - database operations will fail');
            throw new Error('Prisma client failed to initialize. Check your DATABASE_URL and database connection.');
          };
        }
        
        // For model operations, return functions that throw meaningful errors
        return new Proxy({}, {
          get(modelTarget, operation) {
            return async () => {
              console.warn(`Fallback: ${String(prop)}.${String(operation)} called but Prisma client failed to initialize`);
              throw new Error('Prisma client failed to initialize. Check your DATABASE_URL and database connection.');
            };
          }
        });
      }
    });
    
    _prismaClient = fallbackClient;
    return fallbackClient;
  }
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
    // During build time or connection errors, return fallback value
    if (error instanceof Error && 
        (error.message.includes('did not initialize yet') || 
         error.message.includes('connection') ||
         error.message.includes('failed to initialize') ||
         isBuildTime)) {
      console.warn('Prisma operation failed, using fallback:', error.message)
      return fallback
    }
    throw error
  }
}

// Export the connection test function to be used when needed
export async function testConnection() {
  try {
    if (isBuildTime) {
      console.log('Build time detected - skipping connection test')
      return true;
    }
    
    const client = getPrismaClient();
    // Test query to verify connection
    await client.$queryRaw`SELECT 1`
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    return false
  }
}

// Export a function to get the Prisma client (with lazy initialization)
export function getPrismaClient(): PrismaClient {
  return initializePrisma();
}

// Export the prisma instance getter for backward compatibility
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient();
    return client[prop as keyof PrismaClient];
  }
});