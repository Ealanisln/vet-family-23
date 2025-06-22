import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

// Mock the Kinde server session
jest.mock('@kinde-oss/kinde-auth-nextjs/server')

const mockGetKindeServerSession = getKindeServerSession as jest.MockedFunction<typeof getKindeServerSession>;

describe('Authentication Middleware', () => {
  let mockRequest: NextRequest
  
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock implementation
    mockGetKindeServerSession.mockReturnValue({
      getUser: jest.fn(),
      isAuthenticated: jest.fn(),
      getAccessToken: jest.fn(),
      getPermissions: jest.fn(),
      getOrganization: jest.fn(),
    })
  })

  const createMockRequest = (pathname: string, headers: Record<string, string> = {}) => {
    return new NextRequest(
      new URL(pathname, 'http://localhost:3000'),
      {
        headers: new Headers(headers),
      }
    )
  }

  describe('Public Routes', () => {
    test('should allow access to home page', async () => {
      mockRequest = createMockRequest('/')
      const response = await middleware(mockRequest)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    test('should allow access to blog pages', async () => {
      mockRequest = createMockRequest('/blog')
      const response = await middleware(mockRequest)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    test('should allow access to promotion pages', async () => {
      mockRequest = createMockRequest('/promociones')
      const response = await middleware(mockRequest)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    test('should allow access to static assets', async () => {
      const staticPaths = [
        '/_next/static/chunks/main.js',
        '/assets/logo.png',
        '/favicon.ico',
        '/images/banner.jpg'
      ]

      for (const path of staticPaths) {
        mockRequest = createMockRequest(path)
        const response = await middleware(mockRequest)
        
        expect(response).toBeInstanceOf(NextResponse)
        expect(response.status).toBe(200)
      }
    })

    test('should allow access to auth routes', async () => {
      const authPaths = [
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/callback'
      ]

      for (const path of authPaths) {
        mockRequest = createMockRequest(path)
        const response = await middleware(mockRequest)
        
        expect(response).toBeInstanceOf(NextResponse)
        expect(response.status).toBe(200)
      }
    })
  })

  describe('Protected Admin Routes', () => {
    test('should allow authenticated user to access admin routes', async () => {
      const mockUser = {
        id: 'user123',
        email: 'admin@vetfamily.com',
        given_name: 'Admin',
        family_name: 'User'
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getAccessToken: jest.fn().mockResolvedValue('mock-token'),
        getPermissions: jest.fn().mockResolvedValue(['read:admin']),
        getOrganization: jest.fn(),
      })

      mockRequest = createMockRequest('/admin/dashboard')
      const response = await middleware(mockRequest)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
      expect(response.headers.get('Cache-Control')).toBe('no-store, must-revalidate, max-age=0')
    })

    test('should redirect unauthenticated user to login', async () => {
      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(null),
        isAuthenticated: jest.fn().mockResolvedValue(false),
        getAccessToken: jest.fn().mockResolvedValue(null),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockRequest = createMockRequest('/admin/dashboard')
      const response = await middleware(mockRequest)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(307) // Redirect status
      
      const location = response.headers.get('location')
      expect(location).toContain('/api/auth/login')
      expect(location).toContain('post_login_redirect_url')
    })

    test('should handle authentication errors gracefully', async () => {
      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        isAuthenticated: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        getAccessToken: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        getPermissions: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        getOrganization: jest.fn(),
      })

      mockRequest = createMockRequest('/admin/dashboard')
      const response = await middleware(mockRequest)
      
      // Should continue to allow access when auth fails to prevent app breakage
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    test('should prevent redirect loops', async () => {
      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(null),
        isAuthenticated: jest.fn().mockResolvedValue(false),
        getAccessToken: jest.fn().mockResolvedValue(null),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      // Simulate a request that already has redirect parameters
      mockRequest = createMockRequest('/admin/dashboard?post_login_redirect_url=something')
      const response = await middleware(mockRequest)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(307)
      
      const location = response.headers.get('location')
      expect(location).toBe('http://localhost:3000/api/auth/login')
    })
  })

  describe('POS Routes', () => {
    test('should allow access to POS API routes', async () => {
      const posRoutes = [
        '/api/pos/inventory',
        '/api/pos/sales',
        '/api/pos/services'
      ]

      for (const path of posRoutes) {
        mockRequest = createMockRequest(path)
        const response = await middleware(mockRequest)
        
        expect(response).toBeInstanceOf(NextResponse)
        expect(response.status).toBe(200)
      }
    })
  })

  describe('Middleware Configuration', () => {
    test('should have correct matcher configuration', () => {
      // Test that the middleware config is properly set
      const { config } = require('@/middleware')
      
      expect(config).toBeDefined()
      expect(config.matcher).toBeInstanceOf(Array)
      expect(config.matcher).toContain('/admin/:path*')
      expect(config.matcher).toContain('/api/pos/:path*')
    })
  })

  describe('Session Management', () => {
    test('should set proper cache headers for authenticated routes', async () => {
      const mockUser = {
        id: 'user123',
        email: 'user@vetfamily.com'
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getAccessToken: jest.fn().mockResolvedValue('mock-token'),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockRequest = createMockRequest('/admin/clientes')
      const response = await middleware(mockRequest)
      
      expect(response.headers.get('Cache-Control')).toBe('no-store, must-revalidate, max-age=0')
      expect(response.headers.get('Pragma')).toBe('no-cache')
      expect(response.headers.get('Expires')).toBe('0')
    })

    test('should handle partial authentication state', async () => {
      // User exists but isAuthenticated returns null
      const mockUser = {
        id: 'user123',
        email: 'user@vetfamily.com'
      }

      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(mockUser),
        isAuthenticated: jest.fn().mockResolvedValue(null),
        getAccessToken: jest.fn().mockResolvedValue('mock-token'),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      mockRequest = createMockRequest('/admin/mascotas')
      const response = await middleware(mockRequest)
      
      // Should allow access since we have user info
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })
  })
}) 