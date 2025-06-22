import { randomUUID } from 'crypto'
import { PrismaClient } from '@prisma/client'

// Test data factories
export const createMockUser = (overrides?: Partial<any>) => ({
  id: randomUUID(),
  kindeId: `kinde_${randomUUID()}`,
  email: 'test@vetfamily.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockClient = (overrides?: Partial<any>) => ({
  id: randomUUID(),
  name: 'Test Client',
  email: 'client@example.com',
  phone: '123-456-7890',
  address: '123 Test Street',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockPet = (clientId?: string, overrides?: Partial<any>) => ({
  id: randomUUID(),
  name: 'Test Pet',
  species: 'Dog',
  breed: 'Golden Retriever',
  age: 3,
  weight: 30.5,
  gender: 'MALE',
  clientId: clientId || randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockInventoryItem = (overrides?: Partial<any>) => ({
  id: randomUUID(),
  name: 'Test Medication',
  description: 'Test medication for pets',
  category: 'MEDICATION',
  stock: 50,
  minStock: 10,
  maxStock: 100,
  price: 25.99,
  cost: 15.00,
  supplier: 'Test Supplier',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockSale = (clientId?: string, userId?: string, overrides?: Partial<any>) => ({
  id: randomUUID(),
  clientId: clientId || randomUUID(),
  userId: userId || randomUUID(),
  total: 100.00,
  status: 'COMPLETED',
  paymentMethod: 'CASH',
  notes: 'Test sale',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockAppointment = (
  clientId?: string,
  petId?: string,
  vetId?: string,
  overrides?: Partial<any>
) => ({
  id: randomUUID(),
  clientId: clientId || randomUUID(),
  petId: petId || randomUUID(),
  vetId: vetId || randomUUID(),
  dateTime: new Date('2024-06-15T10:00:00Z'),
  service: 'Routine Checkup',
  status: 'SCHEDULED',
  notes: 'Test appointment',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockMedicalRecord = (
  petId?: string,
  vetId?: string,
  overrides?: Partial<any>
) => ({
  id: randomUUID(),
  petId: petId || randomUUID(),
  vetId: vetId || randomUUID(),
  type: 'CONSULTATION',
  diagnosis: 'Healthy',
  treatment: 'No treatment needed',
  notes: 'Pet is in good health',
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Database test utilities
export class TestDatabase {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    })
  }

  async connect() {
    await this.prisma.$connect()
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }

  async cleanup() {
    // Clean up in reverse order of dependencies
    const deleteOperations = [
      this.prisma.movementHistory.deleteMany(),
      this.prisma.saleItem.deleteMany(),
      this.prisma.sale.deleteMany(),
      this.prisma.medicalRecord.deleteMany(),
      this.prisma.appointment.deleteMany(),
      this.prisma.pet.deleteMany(),
      this.prisma.client.deleteMany(),
      this.prisma.inventoryItem.deleteMany(),
      this.prisma.userRole.deleteMany(),
      this.prisma.role.deleteMany(),
      this.prisma.user.deleteMany(),
    ]

    await this.prisma.$transaction(deleteOperations)
  }

  async seedTestData() {
    // Create test roles
    const adminRole = await this.prisma.role.create({
      data: {
        id: randomUUID(),
        key: 'admin',
        name: 'Administrator',
      },
    })

    const vetRole = await this.prisma.role.create({
      data: {
        id: randomUUID(),
        key: 'vet',
        name: 'Veterinarian',
      },
    })

    // Create test users
    const adminUser = await this.prisma.user.create({
      data: createMockUser({
        email: 'admin@vetfamily.com',
        name: 'Admin User',
      }),
    })

    const vetUser = await this.prisma.user.create({
      data: createMockUser({
        email: 'vet@vetfamily.com',
        name: 'Vet User',
      }),
    })

    // Assign roles
    await this.prisma.userRole.createMany({
      data: [
        {
          id: randomUUID(),
          userId: adminUser.id,
          roleId: adminRole.id,
        },
        {
          id: randomUUID(),
          userId: vetUser.id,
          roleId: vetRole.id,
        },
      ],
    })

    // Create test clients
    const client1 = await this.prisma.client.create({
      data: createMockClient({
        name: 'John Doe',
        email: 'john@example.com',
      }),
    })

    const client2 = await this.prisma.client.create({
      data: createMockClient({
        name: 'Jane Smith',
        email: 'jane@example.com',
      }),
    })

    // Create test pets
    const pet1 = await this.prisma.pet.create({
      data: createMockPet(client1.id, {
        name: 'Buddy',
        species: 'Dog',
      }),
    })

    const pet2 = await this.prisma.pet.create({
      data: createMockPet(client2.id, {
        name: 'Whiskers',
        species: 'Cat',
      }),
    })

    // Create test inventory items
    const medication = await this.prisma.inventoryItem.create({
      data: createMockInventoryItem({
        name: 'Dog Vaccination',
        category: 'MEDICATION',
        price: 50.00,
      }),
    })

    const equipment = await this.prisma.inventoryItem.create({
      data: createMockInventoryItem({
        name: 'Stethoscope',
        category: 'EQUIPMENT',
        price: 150.00,
      }),
    })

    return {
      users: { admin: adminUser, vet: vetUser },
      roles: { admin: adminRole, vet: vetRole },
      clients: { client1, client2 },
      pets: { pet1, pet2 },
      inventory: { medication, equipment },
    }
  }

  getPrisma() {
    return this.prisma
  }
}

// Authentication test helpers
export const createMockKindeSession = (user?: any, authenticated = true) => ({
  getUser: jest.fn().mockResolvedValue(user),
  isAuthenticated: jest.fn().mockResolvedValue(authenticated),
  getAccessToken: jest.fn().mockResolvedValue(authenticated ? 'mock-token' : null),
  getPermissions: jest.fn().mockResolvedValue([]),
  getOrganization: jest.fn().mockResolvedValue(null),
})

export const createMockRequest = (
  url: string,
  options?: {
    method?: string
    body?: any
    headers?: Record<string, string>
  }
) => {
  const { method = 'GET', body, headers = {} } = options || {}
  
  const mockRequest = new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  return mockRequest as any // NextRequest compatible
}

// Assertion helpers
export const expectSuccessResponse = (response: Response, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')
}

export const expectErrorResponse = (response: Response, expectedStatus = 400) => {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')
}

export const expectValidationError = async (response: Response, field?: string) => {
  expect(response.status).toBe(400)
  const data = await response.json()
  expect(data.error).toBeDefined()
  if (field) {
    expect(data.error.toLowerCase()).toContain(field.toLowerCase())
  }
}

export const expectAuthError = (response: Response) => {
  expect([401, 403]).toContain(response.status)
}

// Date helpers for testing
export const createDateInFuture = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export const createDateInPast = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// Mock data generators
export const generateClients = (count: number) => {
  return Array.from({ length: count }, (_, i) =>
    createMockClient({
      name: `Test Client ${i + 1}`,
      email: `client${i + 1}@example.com`,
    })
  )
}

export const generatePets = (clientId: string, count: number) => {
  const species = ['Dog', 'Cat', 'Bird', 'Rabbit']
  return Array.from({ length: count }, (_, i) =>
    createMockPet(clientId, {
      name: `Pet ${i + 1}`,
      species: species[i % species.length],
    })
  )
}

export const generateInventoryItems = (count: number) => {
  const categories = ['MEDICATION', 'EQUIPMENT', 'SUPPLIES', 'FOOD']
  return Array.from({ length: count }, (_, i) =>
    createMockInventoryItem({
      name: `Item ${i + 1}`,
      category: categories[i % categories.length],
      price: (i + 1) * 10,
    })
  )
}

// Performance testing helpers
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = Date.now()
  const result = await fn()
  const duration = Date.now() - start
  return { result, duration }
}

export const expectExecutionTime = (duration: number, maxMs: number) => {
  expect(duration).toBeLessThan(maxMs)
}

// API response helpers
export const extractJsonResponse = async (response: Response) => {
  const data = await response.json()
  return data
}

export const expectPaginatedResponse = (data: any, page: number, limit: number) => {
  expect(data.pagination).toBeDefined()
  expect(data.pagination.page).toBe(page)
  expect(data.pagination.limit).toBe(limit)
  expect(typeof data.pagination.total).toBe('number')
  expect(typeof data.pagination.totalPages).toBe('number')
}

// Error testing helpers
export const createNetworkError = () => new Error('Network request failed')
export const createDatabaseError = () => new Error('Database connection failed')
export const createValidationError = (field: string) => new Error(`Validation failed for ${field}`)

// Test environment setup
export const setupTestEnvironment = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test'
  process.env.KINDE_SITE_URL = 'http://localhost:3000'
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
}

export const teardownTestEnvironment = () => {
  // Clean up environment variables if needed
  delete process.env.TEST_DATABASE_URL
}

// Export test database instance
export const testDb = new TestDatabase()

export default {
  createMockUser,
  createMockClient,
  createMockPet,
  createMockInventoryItem,
  createMockSale,
  createMockAppointment,
  createMockMedicalRecord,
  TestDatabase,
  testDb,
  createMockKindeSession,
  createMockRequest,
  expectSuccessResponse,
  expectErrorResponse,
  expectValidationError,
  expectAuthError,
  measureExecutionTime,
  expectExecutionTime,
  setupTestEnvironment,
  teardownTestEnvironment,
} 