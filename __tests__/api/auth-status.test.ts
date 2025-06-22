import { NextRequest } from 'next/server'
import { GET } from '@/app/api/auth-status/route'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { prisma } from '@/lib/prismaDB'

// Mock dependencies
jest.mock('@kinde-oss/kinde-auth-nextjs/server')
jest.mock('@/lib/prismaDB', () => ({
  prisma: {
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
  },
}))

const mockGetKindeServerSession = getKindeServerSession as jest.MockedFunction<typeof getKindeServerSession>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/auth-status', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = new NextRequest('http://localhost:3000/api/auth-status')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Authenticated User', () => {
    it('should return user data for authenticated user', async () => {
      const mockUser = {
        id: 'kinde_user_123',
        email: 'test@vetfamily.com',
        given_name: 'Test',
        family_name: 'User',
      }

      const mockDbUser = {
        id: 'db_user_123',
        kindeId: 'kinde_user_123',
        email: 'test@vetfamily.com',
        userRoles: [
          {
            id: 'user_role_1',
            role: {
              id: 'role_1',
              key: 'vet',
              name: 'Veterinarian',
            },
          },
        ],
      }

      const mockAccessToken = {
        roles: [
          { key: 'vet', name: 'Veterinarian' },
        ],
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getAccessToken: jest.fn().mockResolvedValue(mockAccessToken),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockPrisma.user.findUnique.mockResolvedValue(mockDbUser)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.isAuthenticated).toBe(true)
      expect(data.user.id).toBe(mockUser.id)
      expect(data.user.email).toBe(mockUser.email)
      expect(data.dbUser).toEqual(mockDbUser)
      expect(data.roles).toHaveLength(1)
      expect(data.roles[0].key).toBe('vet')
    })

    it('should create new user if not exists in database', async () => {
      const mockUser = {
        id: 'kinde_user_new',
        email: 'newuser@vetfamily.com',
        given_name: 'New',
        family_name: 'User',
      }

      const mockCreatedUser = {
        id: 'db_user_new',
        kindeId: 'kinde_user_new',
        email: 'newuser@vetfamily.com',
        userRoles: [],
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getAccessToken: jest.fn().mockResolvedValue({ roles: [] }),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.findFirst.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          kindeId: mockUser.id,
          email: mockUser.email,
        },
        include: { userRoles: { include: { role: true } } },
      })
      expect(data.dbUser).toEqual(mockCreatedUser)
    })

    it('should update existing user with new kindeId', async () => {
      const mockUser = {
        id: 'kinde_user_updated',
        email: 'existing@vetfamily.com',
        given_name: 'Existing',
        family_name: 'User',
      }

      const mockExistingUser = {
        id: 'db_user_existing',
        kindeId: null,
        email: 'existing@vetfamily.com',
        userRoles: [],
      }

      const mockUpdatedUser = {
        ...mockExistingUser,
        kindeId: 'kinde_user_updated',
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getAccessToken: jest.fn().mockResolvedValue({ roles: [] }),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.findFirst.mockResolvedValue(mockExistingUser)
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockExistingUser.id },
        data: { kindeId: mockUser.id },
        include: { userRoles: { include: { role: true } } },
      })
      expect(data.dbUser.kindeId).toBe(mockUser.id)
    })
  })

  describe('Unauthenticated User', () => {
    it('should return unauthenticated status when no user', async () => {
      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(null),
        isAuthenticated: jest.fn().mockResolvedValue(false),
        getAccessToken: jest.fn().mockResolvedValue(null),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.isAuthenticated).toBe(false)
      expect(data.user).toBeNull()
      expect(data.dbUser).toBeNull()
      expect(data.roles).toEqual([])
    })
  })

  describe('Role Management', () => {
    it('should sync roles from Kinde access token', async () => {
      const mockUser = {
        id: 'kinde_user_roles',
        email: 'roles@vetfamily.com',
      }

      const mockDbUser = {
        id: 'db_user_roles',
        kindeId: 'kinde_user_roles',
        email: 'roles@vetfamily.com',
        userRoles: [
          {
            id: 'user_role_old',
            role: { id: 'role_old', key: 'old_role', name: 'Old Role' },
          },
        ],
      }

      const mockAccessToken = {
        roles: [
          { key: 'admin', name: 'Administrator' },
          { key: 'vet', name: 'Veterinarian' },
        ],
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getAccessToken: jest.fn().mockResolvedValue(mockAccessToken),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockPrisma.user.findUnique.mockResolvedValue(mockDbUser)
      mockPrisma.role.upsert.mockResolvedValue({ id: 'role_1', key: 'admin', name: 'Administrator' })

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.role.upsert).toHaveBeenCalledTimes(2) // For admin and vet roles
      expect(mockPrisma.userRole.create).toHaveBeenCalledTimes(2) // For new roles
      expect(mockPrisma.userRole.delete).toHaveBeenCalledTimes(1) // For removed old role
    })
  })

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockRejectedValue(new Error('Kinde error')),
        isAuthenticated: jest.fn().mockRejectedValue(new Error('Kinde error')),
        getAccessToken: jest.fn().mockRejectedValue(new Error('Kinde error')),
        getPermissions: jest.fn().mockRejectedValue(new Error('Kinde error')),
        getOrganization: jest.fn(),
      })

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.isAuthenticated).toBe(false)
      expect(data.user).toBeNull()
    })

    it('should handle database errors and return 500', async () => {
      const mockUser = {
        id: 'kinde_user_error',
        email: 'error@vetfamily.com',
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getAccessToken: jest.fn().mockResolvedValue({ roles: [] }),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'))

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal Server Error')
      expect(data.details).toBe('Database connection failed')
    })

    it('should disconnect prisma client after each request', async () => {
      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(null),
        isAuthenticated: jest.fn().mockResolvedValue(false),
        getAccessToken: jest.fn().mockResolvedValue(null),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      await GET(mockRequest)

      expect(mockPrisma.$disconnect).toHaveBeenCalled()
    })
  })

  describe('Access Token Handling', () => {
    it('should handle invalid access token structure', async () => {
      const mockUser = {
        id: 'kinde_user_invalid_token',
        email: 'invalid@vetfamily.com',
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getAccessToken: jest.fn().mockResolvedValue('invalid-token-string'),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'db_user_invalid',
        kindeId: 'kinde_user_invalid_token',
        email: 'invalid@vetfamily.com',
        userRoles: [],
      })

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.roles).toEqual([]) // Should handle gracefully
    })

    it('should handle null access token', async () => {
      const mockUser = {
        id: 'kinde_user_null_token',
        email: 'null@vetfamily.com',
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getAccessToken: jest.fn().mockResolvedValue(null),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'db_user_null',
        kindeId: 'kinde_user_null_token',
        email: 'null@vetfamily.com',
        userRoles: [],
      })

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.roles).toEqual([])
    })
  })
}) 