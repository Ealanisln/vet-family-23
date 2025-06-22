import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

// Use a test database for integration tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
})

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    // Connect to the database
    await prisma.$connect()
  })

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData()
  })

  const cleanupTestData = async () => {
    // Clean up in reverse order of dependencies
    await prisma.movementHistory.deleteMany({
      where: { reason: { contains: 'TEST' } },
    })
    await prisma.saleItem.deleteMany({
      where: { sale: { notes: { contains: 'TEST' } } },
    })
    await prisma.sale.deleteMany({
      where: { notes: { contains: 'TEST' } },
    })
    await prisma.medicalRecord.deleteMany({
      where: { notes: { contains: 'TEST' } },
    })
    await prisma.appointment.deleteMany({
      where: { notes: { contains: 'TEST' } },
    })
    await prisma.pet.deleteMany({
      where: { name: { contains: 'TEST' } },
    })
    await prisma.client.deleteMany({
      where: { name: { contains: 'TEST' } },
    })
    await prisma.inventoryItem.deleteMany({
      where: { name: { contains: 'TEST' } },
    })
    await prisma.userRole.deleteMany({
      where: { user: { email: { contains: 'test@' } } },
    })
    await prisma.user.deleteMany({
      where: { email: { contains: 'test@' } },
    })
  }

  describe('User Management', () => {
    it('should create and retrieve a user', async () => {
      const userData = {
        id: randomUUID(),
        kindeId: 'test_kinde_' + randomUUID(),
        email: 'test@example.com',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
      }

      const createdUser = await prisma.user.create({
        data: userData,
      })

      expect(createdUser.id).toBe(userData.id)
      expect(createdUser.email).toBe(userData.email)
      expect(createdUser.name).toBe(userData.name)

      const retrievedUser = await prisma.user.findUnique({
        where: { id: userData.id },
      })

      expect(retrievedUser).not.toBeNull()
      expect(retrievedUser?.email).toBe(userData.email)
    })

    it('should handle user role relationships', async () => {
      const userId = randomUUID()
      const roleId = randomUUID()

      // Create user
      await prisma.user.create({
        data: {
          id: userId,
          kindeId: 'test_kinde_roles',
          email: 'test_roles@example.com',
        },
      })

      // Create role
      await prisma.role.create({
        data: {
          id: roleId,
          key: 'test_vet',
          name: 'Test Veterinarian',
        },
      })

      // Assign role to user
      await prisma.userRole.create({
        data: {
          userId: userId,
          roleId: roleId,
        },
      })

      // Retrieve user with roles
      const userWithRoles = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      })

      expect(userWithRoles).not.toBeNull()
      expect(userWithRoles?.userRoles).toHaveLength(1)
      expect(userWithRoles?.userRoles[0].role.key).toBe('test_vet')
    })
  })

  describe('Client and Pet Management', () => {
    it('should create client with pets', async () => {
      const clientData = {
        id: randomUUID(),
        name: 'TEST Client John Doe',
        email: 'test_client@example.com',
        phone: '123-456-7890',
        address: 'Test Address 123',
      }

      const petData = {
        id: randomUUID(),
        name: 'TEST Pet Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 30.5,
        clientId: clientData.id,
      }

      // Create client
      const createdClient = await prisma.client.create({
        data: clientData,
      })

      // Create pet for client
      const createdPet = await prisma.pet.create({
        data: petData,
      })

      expect(createdClient.name).toBe(clientData.name)
      expect(createdPet.name).toBe(petData.name)
      expect(createdPet.clientId).toBe(clientData.id)

      // Retrieve client with pets
      const clientWithPets = await prisma.client.findUnique({
        where: { id: clientData.id },
        include: {
          pets: true,
        },
      })

      expect(clientWithPets).not.toBeNull()
      expect(clientWithPets?.pets).toHaveLength(1)
      expect(clientWithPets?.pets[0].name).toBe(petData.name)
    })

    it('should handle pet medical records', async () => {
      const clientId = randomUUID()
      const petId = randomUUID()
      const userId = randomUUID()

      // Create necessary entities
      await prisma.user.create({
        data: {
          id: userId,
          kindeId: 'test_vet_user',
          email: 'test_vet@example.com',
        },
      })

      await prisma.client.create({
        data: {
          id: clientId,
          name: 'TEST Medical Client',
          email: 'test_medical@example.com',
        },
      })

      await prisma.pet.create({
        data: {
          id: petId,
          name: 'TEST Medical Pet',
          species: 'Dog',
          clientId: clientId,
        },
      })

      // Create medical record
      const medicalRecordData = {
        id: randomUUID(),
        petId: petId,
        vetId: userId,
        type: 'CONSULTATION',
        diagnosis: 'Routine checkup',
        treatment: 'Vaccination administered',
        notes: 'TEST Pet is healthy',
        date: new Date(),
      }

      const createdRecord = await prisma.medicalRecord.create({
        data: medicalRecordData,
      })

      expect(createdRecord.diagnosis).toBe(medicalRecordData.diagnosis)
      expect(createdRecord.petId).toBe(petId)
      expect(createdRecord.vetId).toBe(userId)

      // Retrieve pet with medical records
      const petWithRecords = await prisma.pet.findUnique({
        where: { id: petId },
        include: {
          medicalRecords: {
            include: {
              vet: true,
            },
          },
        },
      })

      expect(petWithRecords?.medicalRecords).toHaveLength(1)
      expect(petWithRecords?.medicalRecords[0].diagnosis).toBe(medicalRecordData.diagnosis)
    })
  })

  describe('Inventory Management', () => {
    it('should create and manage inventory items', async () => {
      const inventoryData = {
        id: randomUUID(),
        name: 'TEST Vaccination Serum',
        description: 'Test vaccination for dogs',
        category: 'MEDICATION',
        stock: 50,
        minStock: 10,
        maxStock: 100,
        price: 25.99,
        cost: 15.00,
        expiryDate: new Date('2025-12-31'),
        supplier: 'Test Supplier Inc',
      }

      const createdItem = await prisma.inventoryItem.create({
        data: inventoryData,
      })

      expect(createdItem.name).toBe(inventoryData.name)
      expect(createdItem.stock).toBe(inventoryData.stock)
      expect(createdItem.price).toBe(inventoryData.price)

      // Update stock
      const updatedItem = await prisma.inventoryItem.update({
        where: { id: inventoryData.id },
        data: { stock: { decrement: 5 } },
      })

      expect(updatedItem.stock).toBe(45)
    })

    it('should track inventory movement history', async () => {
      const userId = randomUUID()
      const itemId = randomUUID()

      // Create user and inventory item
      await prisma.user.create({
        data: {
          id: userId,
          kindeId: 'test_inventory_user',
          email: 'test_inventory@example.com',
        },
      })

      await prisma.inventoryItem.create({
        data: {
          id: itemId,
          name: 'TEST Movement Item',
          category: 'EQUIPMENT',
          stock: 20,
          price: 10.00,
        },
      })

      // Create movement history
      const movementData = {
        id: randomUUID(),
        inventoryItemId: itemId,
        type: 'SALE',
        quantity: -3,
        reason: 'TEST Sale transaction',
        userId: userId,
      }

      const createdMovement = await prisma.movementHistory.create({
        data: movementData,
      })

      expect(createdMovement.quantity).toBe(-3)
      expect(createdMovement.type).toBe('SALE')

      // Retrieve item with movement history
      const itemWithHistory = await prisma.inventoryItem.findUnique({
        where: { id: itemId },
        include: {
          movementHistory: {
            include: {
              user: true,
            },
          },
        },
      })

      expect(itemWithHistory?.movementHistory).toHaveLength(1)
      expect(itemWithHistory?.movementHistory[0].reason).toBe(movementData.reason)
    })
  })

  describe('Sales and POS System', () => {
    it('should create sales with items', async () => {
      const clientId = randomUUID()
      const saleId = randomUUID()
      const itemId = randomUUID()
      const userId = randomUUID()

      // Create necessary entities
      await prisma.user.create({
        data: {
          id: userId,
          kindeId: 'test_pos_user',
          email: 'test_pos@example.com',
        },
      })

      await prisma.client.create({
        data: {
          id: clientId,
          name: 'TEST Sales Client',
          email: 'test_sales@example.com',
        },
      })

      await prisma.inventoryItem.create({
        data: {
          id: itemId,
          name: 'TEST Sale Item',
          category: 'SERVICE',
          stock: 100,
          price: 50.00,
        },
      })

      // Create sale with transaction
      const saleData = {
        id: saleId,
        clientId: clientId,
        userId: userId,
        total: 100.00,
        status: 'COMPLETED',
        paymentMethod: 'CASH',
        notes: 'TEST Transaction',
      }

      const saleItemData = {
        id: randomUUID(),
        saleId: saleId,
        inventoryItemId: itemId,
        quantity: 2,
        unitPrice: 50.00,
        subtotal: 100.00,
      }

      await prisma.$transaction(async (tx) => {
        // Create sale
        const sale = await tx.sale.create({
          data: saleData,
        })

        // Create sale items
        await tx.saleItem.create({
          data: saleItemData,
        })

        // Update inventory
        await tx.inventoryItem.update({
          where: { id: itemId },
          data: { stock: { decrement: 2 } },
        })

        return sale
      })

      // Verify sale was created
      const createdSale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          items: {
            include: {
              inventoryItem: true,
            },
          },
          client: true,
        },
      })

      expect(createdSale).not.toBeNull()
      expect(createdSale?.total).toBe(100.00)
      expect(createdSale?.items).toHaveLength(1)
      expect(createdSale?.items[0].quantity).toBe(2)

      // Verify inventory was updated
      const updatedItem = await prisma.inventoryItem.findUnique({
        where: { id: itemId },
      })

      expect(updatedItem?.stock).toBe(98)
    })
  })

  describe('Appointment System', () => {
    it('should create and manage appointments', async () => {
      const clientId = randomUUID()
      const petId = randomUUID()
      const vetId = randomUUID()

      // Create necessary entities
      await prisma.user.create({
        data: {
          id: vetId,
          kindeId: 'test_appointment_vet',
          email: 'test_appointment_vet@example.com',
        },
      })

      await prisma.client.create({
        data: {
          id: clientId,
          name: 'TEST Appointment Client',
          email: 'test_appointment@example.com',
        },
      })

      await prisma.pet.create({
        data: {
          id: petId,
          name: 'TEST Appointment Pet',
          species: 'Cat',
          clientId: clientId,
        },
      })

      // Create appointment
      const appointmentData = {
        id: randomUUID(),
        clientId: clientId,
        petId: petId,
        vetId: vetId,
        dateTime: new Date('2024-06-15T10:00:00Z'),
        service: 'Routine Checkup',
        status: 'SCHEDULED',
        notes: 'TEST Regular appointment',
      }

      const createdAppointment = await prisma.appointment.create({
        data: appointmentData,
      })

      expect(createdAppointment.service).toBe(appointmentData.service)
      expect(createdAppointment.status).toBe('SCHEDULED')

      // Update appointment status
      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentData.id },
        data: { status: 'COMPLETED' },
      })

      expect(updatedAppointment.status).toBe('COMPLETED')

      // Retrieve appointment with all relations
      const fullAppointment = await prisma.appointment.findUnique({
        where: { id: appointmentData.id },
        include: {
          client: true,
          pet: true,
          vet: true,
        },
      })

      expect(fullAppointment).not.toBeNull()
      expect(fullAppointment?.client.name).toBe('TEST Appointment Client')
      expect(fullAppointment?.pet.name).toBe('TEST Appointment Pet')
    })
  })

  describe('Database Constraints and Validation', () => {
    it('should enforce foreign key constraints', async () => {
      // Try to create a pet with non-existent client
      await expect(
        prisma.pet.create({
          data: {
            id: randomUUID(),
            name: 'TEST Orphan Pet',
            species: 'Dog',
            clientId: 'non-existent-client-id',
          },
        })
      ).rejects.toThrow()
    })

    it('should enforce unique constraints', async () => {
      const userData = {
        id: randomUUID(),
        kindeId: 'unique_test_kinde',
        email: 'unique_test@example.com',
      }

      // Create first user
      await prisma.user.create({
        data: userData,
      })

      // Try to create another user with same email
      await expect(
        prisma.user.create({
          data: {
            id: randomUUID(),
            kindeId: 'another_kinde_id',
            email: userData.email, // Same email
          },
        })
      ).rejects.toThrow()
    })

    it('should handle transaction rollback on error', async () => {
      const clientId = randomUUID()

      await prisma.client.create({
        data: {
          id: clientId,
          name: 'TEST Transaction Client',
          email: 'test_transaction@example.com',
        },
      })

      // Try transaction that should fail
      await expect(
        prisma.$transaction(async (tx) => {
          // This should succeed
          await tx.pet.create({
            data: {
              id: randomUUID(),
              name: 'TEST Transaction Pet',
              species: 'Dog',
              clientId: clientId,
            },
          })

          // This should fail (non-existent client)
          await tx.pet.create({
            data: {
              id: randomUUID(),
              name: 'TEST Invalid Pet',
              species: 'Cat',
              clientId: 'non-existent-client',
            },
          })
        })
      ).rejects.toThrow()

      // Verify no pets were created (rollback worked)
      const pets = await prisma.pet.findMany({
        where: { clientId: clientId },
      })

      expect(pets).toHaveLength(0)
    })
  })

  describe('Performance and Optimization', () => {
    it('should efficiently query with includes', async () => {
      const clientId = randomUUID()
      const petId = randomUUID()

      await prisma.client.create({
        data: {
          id: clientId,
          name: 'TEST Performance Client',
          email: 'test_performance@example.com',
        },
      })

      await prisma.pet.create({
        data: {
          id: petId,
          name: 'TEST Performance Pet',
          species: 'Dog',
          clientId: clientId,
        },
      })

      const start = Date.now()

      const result = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          pets: {
            include: {
              medicalRecords: true,
              appointments: true,
            },
          },
        },
      })

      const duration = Date.now() - start

      expect(result).not.toBeNull()
      expect(result?.pets).toHaveLength(1)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle pagination correctly', async () => {
      // Create multiple test clients
      const clientIds = []
      for (let i = 0; i < 15; i++) {
        const clientId = randomUUID()
        clientIds.push(clientId)
        await prisma.client.create({
          data: {
            id: clientId,
            name: `TEST Pagination Client ${i}`,
            email: `test_pagination_${i}@example.com`,
          },
        })
      }

      // Test pagination
      const page1 = await prisma.client.findMany({
        where: { name: { contains: 'TEST Pagination' } },
        take: 5,
        skip: 0,
        orderBy: { name: 'asc' },
      })

      const page2 = await prisma.client.findMany({
        where: { name: { contains: 'TEST Pagination' } },
        take: 5,
        skip: 5,
        orderBy: { name: 'asc' },
      })

      expect(page1).toHaveLength(5)
      expect(page2).toHaveLength(5)
      expect(page1[0].name).not.toBe(page2[0].name)
    })
  })
}) 