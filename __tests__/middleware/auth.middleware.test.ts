import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { createMockKindeSession } from '../utils/test-helpers'

// Mock the Kinde server session
jest.mock('@kinde-oss/kinde-auth-nextjs/server')

const mockGetKindeServerSession = getKindeServerSession as jest.MockedFunction<typeof getKindeServerSession>;

describe('Authentication Middleware', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
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

      const mockSession = createMockKindeSession(mockUser, true)
      mockSession.getPermissions.mockResolvedValue({ permissions: ['read:admin'], orgCode: null })
      mockGetKindeServerSession.mockReturnValue(mockSession as any)

      mockRequest = createMockRequest('/admin/dashboard')
      const response = await middleware(mockRequest)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
      expect(response.headers.get('Cache-Control')).toBe('no-store, must-revalidate, max-age=0')
    })

    test('should redirect unauthenticated user to login', async () => {
      const mockSession = createMockKindeSession(null, false)
      mockGetKindeServerSession.mockReturnValue(mockSession as any)

      mockRequest = createMockRequest('/admin/dashboard')
      const response = await middleware(mockRequest)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(307) // Redirect status
      
      const location = response.headers.get('location')
      expect(location).toContain('/api/auth/login')
      expect(location).toContain('post_login_redirect_url')
    })

    test('should handle authentication errors gracefully', async () => {
      const mockSession = createMockKindeSession(null, false)
      mockSession.getUser.mockRejectedValue(new Error('Authentication failed'))
      mockSession.isAuthenticated.mockRejectedValue(new Error('Authentication failed'))
      mockSession.getAccessToken.mockRejectedValue(new Error('Authentication failed'))
      mockSession.getPermissions.mockRejectedValue(new Error('Authentication failed'))
      mockGetKindeServerSession.mockReturnValue(mockSession as any)

      mockRequest = createMockRequest('/admin/dashboard')
      const response = await middleware(mockRequest)
      
      // Should continue to allow access when auth fails to prevent app breakage
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    test('should prevent redirect loops', async () => {
      const mockSession = createMockKindeSession(null, false)
      mockGetKindeServerSession.mockReturnValue(mockSession as any)

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

      const mockSession = createMockKindeSession(mockUser, true)
      mockGetKindeServerSession.mockReturnValue(mockSession as any)

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

      const mockSession = createMockKindeSession(mockUser, true)
      mockSession.isAuthenticated.mockResolvedValue(null as any)
      mockGetKindeServerSession.mockReturnValue(mockSession as any)

      mockRequest = createMockRequest('/admin/mascotas')
      const response = await middleware(mockRequest)
      
      // Should allow access since we have user info
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })
  })
}) 