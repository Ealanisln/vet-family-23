/**
 * @jest-environment node
 */

import { GET } from '@/app/api/clients/search/route'
import { NextResponse } from 'next/server'

// Mock Prisma
const mockFindMany = jest.fn()
jest.mock('@/lib/prismaDB', () => ({
  prisma: {
    user: {
      findMany: mockFindMany,
    },
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

describe('/api/clients/search', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/clients/search', () => {
    it('should return clients when valid query is provided', async () => {
      // Arrange
      const mockClients = [
        {
          id: 'client1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        {
          id: 'client2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '098-765-4321',
        },
      ]

      mockFindMany.mockResolvedValue(mockClients as never)

      const request = new Request('http://localhost:3000/api/clients/search?q=john')

      // Act
      await GET(request)

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
            { phone: { contains: 'john', mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
        take: 10,
      })

      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        clients: mockClients,
      })
    })

    it('should return error when query parameter is missing', async () => {
      // Arrange
      const request = new Request('http://localhost:3000/api/clients/search')

      // Act
      await GET(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      )
    })

    it('should return error when query parameter is empty', async () => {
      // Arrange
      const request = new Request('http://localhost:3000/api/clients/search?q=')

      // Act
      await GET(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      )
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockError = new Error('Database connection failed')
      mockFindMany.mockRejectedValue(mockError)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const request = new Request('http://localhost:3000/api/clients/search?q=test')

      // Act
      await GET(request)

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error searching clients:', mockError)
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Error searching clients' },
        { status: 500 }
      )

      consoleSpy.mockRestore()
    })

    it('should return empty results when no clients match', async () => {
      // Arrange
      mockFindMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/clients/search?q=nonexistent')

      // Act
      await GET(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        clients: [],
      })
    })

    it('should search across all specified fields', async () => {
      // Arrange
      mockFindMany.mockResolvedValue([])

      const searchTerm = 'search123'
      const request = new Request(`http://localhost:3000/api/clients/search?q=${searchTerm}`)

      // Act
      await GET(request)

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
        take: 10,
      })
    })

    it('should limit results to 10 items', async () => {
      // Arrange
      mockFindMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/clients/search?q=test')

      // Act
      await GET(request)

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      )
    })
  })
}) 