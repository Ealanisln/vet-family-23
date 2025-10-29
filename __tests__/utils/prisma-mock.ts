import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Create a deep mock of PrismaClient that includes all Prisma methods with Jest mock capabilities
export type MockPrismaClient = DeepMockProxy<PrismaClient>

// Singleton instance of the mock Prisma client
let mockPrisma: MockPrismaClient

/**
 * Gets or creates a mock Prisma client instance
 * This mock has all Prisma methods with Jest mock capabilities (.mockResolvedValue, etc.)
 */
export const getMockPrismaClient = (): MockPrismaClient => {
  if (!mockPrisma) {
    mockPrisma = mockDeep<PrismaClient>()
  }
  return mockPrisma
}

/**
 * Resets all mocks on the Prisma client
 * Call this in beforeEach/afterEach to ensure clean test state
 */
export const resetMockPrismaClient = () => {
  if (mockPrisma) {
    mockReset(mockPrisma)
  }
}

/**
 * Creates a fresh mock Prisma client instance
 * Useful when you need a completely new instance for a specific test
 */
export const createMockPrismaClient = (): MockPrismaClient => {
  return mockDeep<PrismaClient>()
}

// Export singleton instance
export const mockPrismaClient = getMockPrismaClient()

// Mock the Prisma Client module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}))

export default {
  getMockPrismaClient,
  resetMockPrismaClient,
  createMockPrismaClient,
  mockPrismaClient,
}
