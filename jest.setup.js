// jest.setup.js
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}))

// Mock Kinde Auth
jest.mock('@kinde-oss/kinde-auth-nextjs/server', () => ({
  getKindeServerSession: () => ({
    getUser: jest.fn(),
    isAuthenticated: jest.fn(),
    getAccessToken: jest.fn(),
    getClaim: jest.fn(),
  }),
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.KINDE_CLIENT_ID = 'test_client_id'
process.env.KINDE_CLIENT_SECRET = 'test_client_secret'
process.env.KINDE_ISSUER_URL = 'https://test.kinde.com'
process.env.KINDE_SITE_URL = 'http://localhost:3000'
process.env.KINDE_POST_LOGOUT_REDIRECT_URL = 'http://localhost:3000'
process.env.KINDE_POST_LOGIN_REDIRECT_URL = 'http://localhost:3000/dashboard'

// Global test utilities
global.mockConsoleError = () => {
  const originalError = console.error
  console.error = jest.fn()
  return () => {
    console.error = originalError
  }
}

// Suppress console warnings during tests unless explicitly needed
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (
      args[0]?.includes('Warning: ReactDOM.render is no longer supported') ||
      args[0]?.includes('Warning: React.renderToString is deprecated')
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
}) 