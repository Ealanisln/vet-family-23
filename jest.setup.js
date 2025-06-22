// Test setup file for Jest
const { TextEncoder, TextDecoder } = require('util')

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.KINDE_CLIENT_ID = 'test-client-id'
process.env.KINDE_CLIENT_SECRET = 'test-client-secret'
process.env.KINDE_ISSUER_URL = 'https://test.kinde.com'
process.env.KINDE_SITE_URL = 'http://localhost:3000'
process.env.KINDE_POST_LOGOUT_REDIRECT_URL = 'http://localhost:3000'
process.env.KINDE_POST_LOGIN_REDIRECT_URL = 'http://localhost:3000/dashboard'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Global polyfills for Node environment (minimal set)
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Kinde Authentication
jest.mock('@kinde-oss/kinde-auth-nextjs/server', () => ({
  getKindeServerSession: jest.fn(() => ({
    getUser: jest.fn(),
    isAuthenticated: jest.fn(),
    getAccessToken: jest.fn(),
    getPermissions: jest.fn(),
    getOrganization: jest.fn(),
  })),
}))

jest.mock('@kinde-oss/kinde-auth-nextjs', () => ({
  useKindeBrowserClient: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    getAccessToken: jest.fn(),
    getPermissions: jest.fn(),
  })),
  LoginLink: ({ children }) => children,
  RegisterLink: ({ children }) => children,
  LogoutLink: ({ children }) => children,
}))

// Mock Prisma Client with proper mock functions
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
  userRole: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  pet: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  appointment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  medicalRecord: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  inventoryItem: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  sale: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  saleItem: {
    createMany: jest.fn(),
  },
  movementHistory: {
    create: jest.fn(),
  },
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $connect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn(),
}

jest.mock('@/lib/prismaDB', () => ({
  prisma: mockPrisma,
}))

// Mock utility functions
jest.mock('@/utils/pos-helpers', () => ({
  userHasPOSPermission: jest.fn(),
}))

// Suppress console warnings in tests
const originalWarn = console.warn
const originalError = console.error
const originalLog = console.log

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('validateDOMNesting') || 
     args[0].includes('Warning: React.jsx') ||
     args[0].includes('PrismaClient'))
  ) {
    return
  }
  originalWarn(...args)
}

console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Error in auth process') ||
     args[0].includes('Error al obtener ventas') ||
     args[0].includes('Error al crear venta'))
  ) {
    return
  }
  originalError(...args)
}

console.log = (...args) => {
  if (
    typeof args[0] === 'string' && 
    args[0].includes('[Middleware] Bypassing all auth checks for debugging')
  ) {
    return
  }
  originalLog(...args)
}

// Global test timeout
jest.setTimeout(10000)

// Global test setup
beforeEach(() => {
  jest.clearAllMocks()
}) 