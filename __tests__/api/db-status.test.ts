/**
 * @jest-environment node
 */

import { GET } from '@/app/api/db-status/route'
import { prisma } from '@/lib/prismaDB'
import { NextResponse } from 'next/server'

// Mock Prisma
jest.mock('@/lib/prismaDB', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ...data,
    })),
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/db-status', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/db-status', () => {
    it('should return success when database connection works', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }])
      
      // Act
      await GET()
      
      // Assert
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(['SELECT 1'])
      expect(NextResponse.json).toHaveBeenCalledWith({
        status: 'success',
        environment: 'test'
      })
    })

    it('should return error when database connection fails', async () => {
      // Arrange
      const mockError = new Error('Connection failed')
      mockPrisma.$queryRaw.mockRejectedValue(mockError)
      
      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Act
      await GET()
      
      // Assert
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(['SELECT 1'])
      expect(consoleSpy).toHaveBeenCalledWith('Database connection error:', mockError)
      expect(NextResponse.json).toHaveBeenCalledWith(
        { status: 'error', message: 'Database connection failed' },
        { status: 500 }
      )
      
      // Cleanup
      consoleSpy.mockRestore()
    })

    it('should handle timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Connection timeout')
      timeoutError.name = 'ConnectionTimeout'
      mockPrisma.$queryRaw.mockRejectedValue(timeoutError)
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Act
      await GET()
      
      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { status: 'error', message: 'Database connection failed' },
        { status: 500 }
      )
      
      consoleSpy.mockRestore()
    })

    it('should return correct environment', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }])
      
      // Act
      await GET()
      
      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({
        status: 'success',
        environment: 'test'
      })
    })
  })
}) 