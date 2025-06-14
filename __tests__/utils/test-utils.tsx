import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock toast para tests
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}))

// Mock Prisma client
export const mockPrismaClient = {
  client: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  inventory: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  pet: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  appointment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  given_name: 'Test',
  family_name: 'User',
  picture: 'https://example.com/avatar.jpg',
}

// Mock client data
export const mockClient = {
  id: 'test-client-id',
  name: 'Test Client',
  email: 'client@example.com',
  phone: '123-456-7890',
  address: '123 Test St',
  city: 'Test City',
  state: 'Test State',
  zipCode: '12345',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  userId: 'test-user-id',
}

// Mock inventory item
export const mockInventoryItem = {
  id: 'test-inventory-id',
  name: 'Test Product',
  description: 'Test Description',
  category: 'Test Category',
  price: 29.99,
  quantity: 10,
  lowStockThreshold: 5,
  sku: 'TEST-001',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  userId: 'test-user-id',
}

// Custom render function
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test utilities
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
}

export const mockApiResponse = (data: unknown, status: number = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response
}

export const mockErrorResponse = (message: string, status: number = 500) => {
  return {
    ok: false,
    status,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
  } as Response
}

// Simple test to make Jest happy
describe('Test Utils', () => {
  it('should export mock data correctly', () => {
    expect(mockUser.id).toBe('test-user-id')
    expect(mockClient.name).toBe('Test Client')
    expect(mockInventoryItem.name).toBe('Test Product')
  })
}) 