/**
 * @jest-environment node
 */

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Mock Kinde Auth
jest.mock('@kinde-oss/kinde-auth-nextjs/server')

// Mock PrismaClient completely
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      upsert: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ...data,
    })),
  },
}))

const mockGetKindeServerSession = getKindeServerSession as jest.MockedFunction<typeof getKindeServerSession>

describe('/api/auth-status', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {} as NextRequest
  })

  describe('GET /api/auth-status', () => {
    it('should handle unauthenticated user', async () => {
      // Arrange
      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(null),
        isAuthenticated: jest.fn().mockResolvedValue(false),
        getAccessToken: jest.fn().mockResolvedValue(null),
      } as never)

      // Dynamically import to use mocked modules
      const { GET } = await import('@/app/api/auth-status/route')

      // Act
      await GET(mockRequest)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({
        user: { roles: [] },
        isAuthenticated: false,
        dbUser: null,
        roles: [],
      })
    })

    it('should handle authentication errors gracefully', async () => {
      // Arrange
      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockRejectedValue(new Error('Auth error')),
        isAuthenticated: jest.fn().mockResolvedValue(false),
        getAccessToken: jest.fn().mockResolvedValue(null),
      } as never)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Dynamically import to use mocked modules  
      const { GET } = await import('@/app/api/auth-status/route')

      // Act
      await GET(mockRequest)

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error in auth process:', expect.any(Error))
      expect(NextResponse.json).toHaveBeenCalledWith({
        user: { roles: [] },
        isAuthenticated: false,
        dbUser: null,
        roles: [],
      })

      consoleSpy.mockRestore()
    })

    it('should handle server errors', async () => {
      // Arrange
      mockGetKindeServerSession.mockImplementation(() => {
        throw new Error('Server error')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Dynamically import to use mocked modules
      const { GET } = await import('@/app/api/auth-status/route')

      // Act
      await GET(mockRequest)

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error in auth-status API route:', expect.any(Error))
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Internal Server Error',
          details: 'Server error',
        },
        { status: 500 }
      )

      consoleSpy.mockRestore()
    })

    it('should properly setup mocks for Kinde session', () => {
      // Arrange & Act
      const session = getKindeServerSession()

      // Assert
      expect(typeof session.getUser).toBe('function')
      expect(typeof session.isAuthenticated).toBe('function')
      expect(typeof session.getAccessToken).toBe('function')
    })
  })
}) 