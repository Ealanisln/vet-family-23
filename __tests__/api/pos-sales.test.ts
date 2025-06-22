import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/pos/sales/route'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { prisma } from '@/lib/prismaDB'
import { userHasPOSPermission } from '@/utils/pos-helpers'

// Mock dependencies
jest.mock('@kinde-oss/kinde-auth-nextjs/server')
jest.mock('@/lib/prismaDB', () => ({
  prisma: {
    sale: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    saleItem: {
      createMany: jest.fn(),
    },
    inventoryItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    movementHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))
jest.mock('@/utils/pos-helpers')

const mockGetKindeServerSession = getKindeServerSession as jest.MockedFunction<typeof getKindeServerSession>;
const mockUserHasPOSPermission = userHasPOSPermission as jest.MockedFunction<typeof userHasPOSPermission>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/pos/sales', () => {
  const mockUser = {
    id: 'user123',
    email: 'pos@vetfamily.com',
    given_name: 'POS',
    family_name: 'User',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockGetKindeServerSession.mockReturnValue({
      getUser: jest.fn().mockResolvedValue(mockUser),
      isAuthenticated: jest.fn().mockResolvedValue(true),
      getAccessToken: jest.fn().mockResolvedValue('mock-token'),
      getPermissions: jest.fn().mockResolvedValue([]),
      getOrganization: jest.fn(),
    })
    
    mockUserHasPOSPermission.mockResolvedValue(true)
  })

  describe('GET /api/pos/sales', () => {
    it('should return sales list for authorized user', async () => {
      const mockSales = [
        {
          id: 'sale1',
          total: 150.00,
          status: 'COMPLETED',
          paymentMethod: 'CASH',
          createdAt: new Date('2024-01-15'),
          client: { name: 'John Doe' },
          items: [
            {
              quantity: 2,
              unitPrice: 75.00,
              inventoryItem: { name: 'Vaccination' },
            },
          ],
        },
        {
          id: 'sale2',
          total: 89.50,
          status: 'COMPLETED',
          paymentMethod: 'CARD',
          createdAt: new Date('2024-01-14'),
          client: { name: 'Jane Smith' },
          items: [
            {
              quantity: 1,
              unitPrice: 89.50,
              inventoryItem: { name: 'Consultation' },
            },
          ],
        },
      ]

      mockPrisma.sale.findMany.mockResolvedValue(mockSales)
      mockPrisma.sale.count.mockResolvedValue(25)

      const url = new URL('http://localhost:3000/api/pos/sales?page=1&limit=10')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sales).toEqual(mockSales)
      expect(data.pagination.total).toBe(25)
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.totalPages).toBe(3)
    })

    it('should filter sales by search term', async () => {
      const mockSales = [
        {
          id: 'sale1',
          total: 150.00,
          client: { name: 'John Doe' },
          items: [],
        },
      ]

      mockPrisma.sale.findMany.mockResolvedValue(mockSales)
      mockPrisma.sale.count.mockResolvedValue(1)

      const url = new URL('http://localhost:3000/api/pos/sales?search=John')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { client: { name: { contains: 'John', mode: 'insensitive' } } },
            ]),
          }),
        })
      )
    })

    it('should filter sales by status', async () => {
      const url = new URL('http://localhost:3000/api/pos/sales?status=COMPLETED')
      const request = new NextRequest(url)

      mockPrisma.sale.findMany.mockResolvedValue([])
      mockPrisma.sale.count.mockResolvedValue(0)

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'COMPLETED',
          }),
        })
      )
    })

    it('should filter sales by date range', async () => {
      const url = new URL('http://localhost:3000/api/pos/sales?startDate=2024-01-01&endDate=2024-01-31')
      const request = new NextRequest(url)

      mockPrisma.sale.findMany.mockResolvedValue([])
      mockPrisma.sale.count.mockResolvedValue(0)

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31'),
            },
          }),
        })
      )
    })

    it('should return 401 for unauthenticated user', async () => {
      mockGetKindeServerSession.mockReturnValue({
        getUser: jest.fn().mockResolvedValue(null),
        isAuthenticated: jest.fn().mockResolvedValue(false),
        getAccessToken: jest.fn().mockResolvedValue(null),
        getPermissions: jest.fn().mockResolvedValue([]),
        getOrganization: jest.fn(),
      })

      const request = new NextRequest('http://localhost:3000/api/pos/sales')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should return 403 for user without POS permissions', async () => {
      mockUserHasPOSPermission.mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/pos/sales')
      const response = await GET(request)

      expect(response.status).toBe(403)
    })
  })

  describe('POST /api/pos/sales', () => {
    const mockSaleData = {
      clientId: 'client123',
      items: [
        {
          inventoryItemId: 'item1',
          quantity: 2,
          unitPrice: 50.00,
        },
        {
          inventoryItemId: 'item2',
          quantity: 1,
          unitPrice: 30.00,
        },
      ],
      paymentMethod: 'CASH',
      notes: 'Regular checkup',
    }

    it('should create a new sale successfully', async () => {
      const mockInventoryItems = [
        {
          id: 'item1',
          name: 'Vaccination',
          stock: 10,
          price: 50.00,
        },
        {
          id: 'item2',
          name: 'Medicine',
          stock: 5,
          price: 30.00,
        },
      ]

      const mockCreatedSale = {
        id: 'newsale123',
        total: 130.00,
        status: 'COMPLETED',
        paymentMethod: 'CASH',
        createdAt: new Date(),
      }

      // Mock inventory items lookup
      mockPrisma.inventoryItem.findUnique
        .mockResolvedValueOnce(mockInventoryItems[0])
        .mockResolvedValueOnce(mockInventoryItems[1])

      // Mock transaction
      mockPrisma.$transaction.mockResolvedValue(mockCreatedSale)

      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify(mockSaleData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.sale).toEqual(mockCreatedSale)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should validate inventory stock before creating sale', async () => {
      const insufficientStockItem = {
        id: 'item1',
        name: 'Vaccination',
        stock: 1, // Less than requested quantity of 2
        price: 50.00,
      }

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(insufficientStockItem)

      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify(mockSaleData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Stock insuficiente')
    })

    it('should return error for non-existent inventory item', async () => {
      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify(mockSaleData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('no encontrado')
    })

    it('should validate required fields', async () => {
      const invalidSaleData = {
        // Missing clientId
        items: [],
        paymentMethod: 'CASH',
      }

      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify(invalidSaleData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('requeridos')
    })

    it('should validate items array is not empty', async () => {
      const invalidSaleData = {
        clientId: 'client123',
        items: [], // Empty items array
        paymentMethod: 'CASH',
      }

      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify(invalidSaleData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('al menos un producto')
    })

    it('should handle database transaction errors', async () => {
      const mockInventoryItem = {
        id: 'item1',
        name: 'Vaccination',
        stock: 10,
        price: 50.00,
      }

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockInventoryItem)
      mockPrisma.$transaction.mockRejectedValue(new Error('Database transaction failed'))

      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify(mockSaleData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Error interno del servidor')
    })

    it('should calculate total correctly', async () => {
      const mockInventoryItems = [
        { id: 'item1', stock: 10, price: 50.00 },
        { id: 'item2', stock: 5, price: 30.00 },
      ]

      mockPrisma.inventoryItem.findUnique
        .mockResolvedValueOnce(mockInventoryItems[0])
        .mockResolvedValueOnce(mockInventoryItems[1])

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma)
      })
      mockPrisma.$transaction.mockImplementation(mockTransaction)

      const mockCreatedSale = {
        id: 'newsale123',
        total: 130.00, // (2 * 50.00) + (1 * 30.00) = 130.00
        status: 'COMPLETED',
      }

      mockPrisma.sale.create.mockResolvedValue(mockCreatedSale)

      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify(mockSaleData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(mockPrisma.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total: 130.00,
          }),
        })
      )
    })

    it('should update inventory stock after successful sale', async () => {
      const mockInventoryItems = [
        { id: 'item1', stock: 10, price: 50.00 },
        { id: 'item2', stock: 5, price: 30.00 },
      ]

      mockPrisma.inventoryItem.findUnique
        .mockResolvedValueOnce(mockInventoryItems[0])
        .mockResolvedValueOnce(mockInventoryItems[1])

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma)
      })
      mockPrisma.$transaction.mockImplementation(mockTransaction)

      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify(mockSaleData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'item1' },
        data: { stock: { decrement: 2 } },
      })
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'item2' },
        data: { stock: { decrement: 1 } },
      })
    })

    it('should create movement history for inventory changes', async () => {
      const mockInventoryItems = [
        { id: 'item1', stock: 10, price: 50.00 },
      ]

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockInventoryItems[0])

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma)
      })
      mockPrisma.$transaction.mockImplementation(mockTransaction)

      const singleItemSale = {
        clientId: 'client123',
        items: [
          {
            inventoryItemId: 'item1',
            quantity: 2,
            unitPrice: 50.00,
          },
        ],
        paymentMethod: 'CASH',
      }

      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify(singleItemSale),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(mockPrisma.movementHistory.create).toHaveBeenCalledWith({
        data: {
          inventoryItemId: 'item1',
          type: 'SALE',
          quantity: -2,
          reason: 'Venta POS',
          userId: mockUser.id,
        },
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('formato')
    })

    it('should handle missing Content-Type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos/sales', {
        method: 'POST',
        body: JSON.stringify({ clientId: 'test' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
}) 