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
    await prisma.inventoryMovement.deleteMany({
      where: { reason: { contains: 'TEST' } },
    })
    await prisma.medicalHistory.deleteMany({
      where: { notes: { contains: 'TEST' } },
    })
    await prisma.appointment.deleteMany({
      where: { reason: { contains: 'TEST' } },
    })
    await prisma.pet.deleteMany({
      where: { name: { contains: 'TEST' } },
    })
    await prisma.inventoryItem.deleteMany({
      where: { name: { contains: 'TEST' } },
    })
    await prisma.userRole.deleteMany({
      where: { User: { email: { contains: 'test@' } } },
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
        updatedAt: new Date(),
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
          updatedAt: new Date(),
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
          id: randomUUID(),
          userId: userId,
          roleId: roleId,
        },
      })

      // Retrieve user with roles
      const userWithRoles = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          UserRole: {
            include: {
              Role: true,
            },
          },
        },
      })

      expect(userWithRoles).not.toBeNull()
      expect(userWithRoles?.UserRole).toHaveLength(1)
      expect(userWithRoles?.UserRole[0].Role.key).toBe('test_vet')
    })
  })

  describe('User and Pet Management', () => {
    it('should create user with pets', async () => {
      const userData = {
        id: randomUUID(),
        kindeId: 'test_pet_owner_' + randomUUID(),
        name: 'TEST User John Doe',
        email: 'test_pet_owner@example.com',
        phone: '123-456-7890',
        address: 'Test Address 123',
        updatedAt: new Date(),
      }

      const petData = {
        id: randomUUID(),
        name: 'TEST Pet Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        dateOfBirth: new Date('2020-01-01'),
        gender: 'MALE',
        weight: 30.5,
        userId: userData.id,
      }

      // Create user
      const createdUser = await prisma.user.create({
        data: userData,
      })

      // Create pet for user
      const createdPet = await prisma.pet.create({
        data: petData,
      })

      expect(createdUser.name).toBe(userData.name)
      expect(createdPet.name).toBe(petData.name)
      expect(createdPet.userId).toBe(userData.id)

      // Retrieve user with pets
      const userWithPets = await prisma.user.findUnique({
        where: { id: userData.id },
        include: {
          Pet: true,
        },
      })

      expect(userWithPets).not.toBeNull()
      expect(userWithPets?.Pet).toHaveLength(1)
      expect(userWithPets?.Pet[0].name).toBe(petData.name)
    })

    it('should handle pet medical history', async () => {
      const userId = randomUUID()
      const petId = randomUUID()

      // Create necessary entities
      await prisma.user.create({
        data: {
          id: userId,
          kindeId: 'test_vet_user',
          email: 'test_vet@example.com',
          updatedAt: new Date(),
        },
      })

      await prisma.pet.create({
        data: {
          id: petId,
          name: 'TEST Medical Pet',
          species: 'Dog',
          breed: 'Labrador',
          dateOfBirth: new Date('2021-03-15'),
          gender: 'MALE',
          weight: 25.0,
          userId: userId,
        },
      })

      // Create medical history
      const medicalHistoryData = {
        id: randomUUID(),
        petId: petId,
        visitDate: new Date(),
        reasonForVisit: 'Routine checkup',
        diagnosis: 'Healthy',
        treatment: 'Vaccination administered',
        prescriptions: ['Vaccine A'],
        notes: 'TEST Pet is healthy',
      }

      const createdRecord = await prisma.medicalHistory.create({
        data: medicalHistoryData,
      })

      expect(createdRecord.diagnosis).toBe(medicalHistoryData.diagnosis)
      expect(createdRecord.petId).toBe(petId)

      // Retrieve pet with medical history
      const petWithRecords = await prisma.pet.findUnique({
        where: { id: petId },
        include: {
          MedicalHistory: true,
        },
      })

      expect(petWithRecords?.MedicalHistory).toHaveLength(1)
      expect(petWithRecords?.MedicalHistory[0].diagnosis).toBe(medicalHistoryData.diagnosis)
    })
  })

  describe('Inventory Management', () => {
    it('should create and manage inventory items', async () => {
      const inventoryData = {
        id: randomUUID(),
        name: 'TEST Vaccination Serum',
        description: 'Test vaccination for dogs',
        category: 'VACCINE' as const,
        quantity: 50,
        minStock: 10,
        price: 25.99,
        cost: 15.00,
        expirationDate: new Date('2025-12-31'),
        updatedAt: new Date(),
      }

      const createdItem = await prisma.inventoryItem.create({
        data: inventoryData,
      })

      expect(createdItem.name).toBe(inventoryData.name)
      expect(createdItem.quantity).toBe(inventoryData.quantity)
      expect(createdItem.price).toBe(inventoryData.price)

      // Update quantity
      const updatedItem = await prisma.inventoryItem.update({
        where: { id: inventoryData.id },
        data: { quantity: { decrement: 5 } },
      })

      expect(updatedItem.quantity).toBe(45)
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
          updatedAt: new Date(),
        },
      })

      await prisma.inventoryItem.create({
        data: {
          id: itemId,
          name: 'TEST Movement Item',
          category: 'CONSUMABLE',
          quantity: 20,
          price: 10.00,
          updatedAt: new Date(),
        },
      })

      // Create inventory movement
      const movementData = {
        id: randomUUID(),
        type: 'OUT' as const,
        quantity: 3,
        reason: 'TEST Sale transaction',
      }

      const createdMovement = await prisma.inventoryMovement.create({
        data: {
          ...movementData,
          InventoryItem: {
            connect: { id: itemId },
          },
          User: {
            connect: { id: userId },
          },
        },
      })

      expect(createdMovement.quantity).toBe(3)
      expect(createdMovement.type).toBe('OUT')

      // Retrieve item with movement history
      const itemWithHistory = await prisma.inventoryItem.findUnique({
        where: { id: itemId },
        include: {
          InventoryMovement: {
            include: {
              User: true,
            },
          },
        },
      })

      expect(itemWithHistory?.InventoryMovement).toHaveLength(1)
      expect(itemWithHistory?.InventoryMovement[0].reason).toBe(movementData.reason)
    })
  })

  // NOTE: Sales and POS System tests removed - Sale and SaleItem models no longer exist in schema
  // These have been replaced with MedicalOrder and related billing functionality

  describe('Appointment System', () => {
    it('should create and manage appointments', async () => {
      const userId = randomUUID()
      const petId = randomUUID()

      // Create necessary entities
      await prisma.user.create({
        data: {
          id: userId,
          kindeId: 'test_appointment_user',
          email: 'test_appointment@example.com',
          updatedAt: new Date(),
        },
      })

      await prisma.pet.create({
        data: {
          id: petId,
          name: 'TEST Appointment Pet',
          species: 'Cat',
          breed: 'Siamese',
          dateOfBirth: new Date('2022-05-10'),
          gender: 'FEMALE',
          weight: 4.5,
          userId: userId,
        },
      })

      // Create appointment
      const appointmentData = {
        id: randomUUID(),
        userId: userId,
        petId: petId,
        dateTime: new Date('2024-06-15T10:00:00Z'),
        reason: 'TEST Routine Checkup',
        status: 'SCHEDULED',
      }

      const createdAppointment = await prisma.appointment.create({
        data: appointmentData,
      })

      expect(createdAppointment.reason).toBe(appointmentData.reason)
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
          User: true,
          Pet: true,
        },
      })

      expect(fullAppointment).not.toBeNull()
      expect(fullAppointment?.Pet.name).toBe('TEST Appointment Pet')
      expect(fullAppointment?.User.id).toBe(userId)
    })
  })

  describe('Database Constraints and Validation', () => {
    it('should enforce foreign key constraints', async () => {
      // Try to create a pet with non-existent user
      await expect(
        prisma.pet.create({
          data: {
            id: randomUUID(),
            name: 'TEST Orphan Pet',
            species: 'Dog',
            breed: 'Unknown',
            dateOfBirth: new Date('2020-01-01'),
            gender: 'MALE',
            weight: 10.0,
            userId: 'non-existent-user-id',
          },
        })
      ).rejects.toThrow()
    })

    it('should enforce unique constraints', async () => {
      const userData = {
        id: randomUUID(),
        kindeId: 'unique_test_kinde',
        email: 'unique_test@example.com',
        updatedAt: new Date(),
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
            updatedAt: new Date(),
          },
        })
      ).rejects.toThrow()
    })

    it('should handle transaction rollback on error', async () => {
      const userId = randomUUID()

      await prisma.user.create({
        data: {
          id: userId,
          kindeId: 'test_transaction_user',
          email: 'test_transaction@example.com',
          updatedAt: new Date(),
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
              breed: 'Labrador',
              dateOfBirth: new Date('2021-01-01'),
              gender: 'MALE',
              weight: 20.0,
              userId: userId,
            },
          })

          // This should fail (non-existent user)
          await tx.pet.create({
            data: {
              id: randomUUID(),
              name: 'TEST Invalid Pet',
              species: 'Cat',
              breed: 'Persian',
              dateOfBirth: new Date('2021-01-01'),
              gender: 'FEMALE',
              weight: 5.0,
              userId: 'non-existent-user',
            },
          })
        })
      ).rejects.toThrow()

      // Verify no pets were created (rollback worked)
      const pets = await prisma.pet.findMany({
        where: { userId: userId },
      })

      expect(pets).toHaveLength(0)
    })
  })

  describe('Performance and Optimization', () => {
    it('should efficiently query with includes', async () => {
      const userId = randomUUID()
      const petId = randomUUID()

      await prisma.user.create({
        data: {
          id: userId,
          kindeId: 'test_performance_user',
          email: 'test_performance@example.com',
          updatedAt: new Date(),
        },
      })

      await prisma.pet.create({
        data: {
          id: petId,
          name: 'TEST Performance Pet',
          species: 'Dog',
          breed: 'Beagle',
          dateOfBirth: new Date('2020-06-01'),
          gender: 'MALE',
          weight: 15.0,
          userId: userId,
        },
      })

      const start = Date.now()

      const result = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          Pet: {
            include: {
              MedicalHistory: true,
              Appointment: true,
            },
          },
        },
      })

      const duration = Date.now() - start

      expect(result).not.toBeNull()
      expect(result?.Pet).toHaveLength(1)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle pagination correctly', async () => {
      // Create multiple test users
      const userIds = []
      for (let i = 0; i < 15; i++) {
        const userId = randomUUID()
        userIds.push(userId)
        await prisma.user.create({
          data: {
            id: userId,
            kindeId: `test_pagination_${i}_${randomUUID()}`,
            name: `TEST Pagination User ${i}`,
            email: `test_pagination_${i}@example.com`,
            updatedAt: new Date(),
          },
        })
      }

      // Test pagination
      const page1 = await prisma.user.findMany({
        where: { name: { contains: 'TEST Pagination' } },
        take: 5,
        skip: 0,
        orderBy: { name: 'asc' },
      })

      const page2 = await prisma.user.findMany({
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