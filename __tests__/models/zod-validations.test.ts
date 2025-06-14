import { z } from 'zod'

// Define validation schemas for critical models
const UserCreateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  kindeId: z.string().min(1, 'Kinde ID is required'),
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone format').optional(),
  address: z.string().optional(),
})

const PetCreateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Pet name is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().min(1, 'Breed is required'),
  dateOfBirth: z.date(),
  gender: z.enum(['MALE', 'FEMALE'], {
    errorMap: () => ({ message: 'Gender must be MALE or FEMALE' })
  }),
  weight: z.number().positive('Weight must be positive'),
  microchipNumber: z.string().optional(),
  isNeutered: z.boolean().default(false),
  isDeceased: z.boolean().default(false),
})

const InventoryItemCreateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(['MEDICINE', 'FOOD', 'ACCESSORY', 'EQUIPMENT', 'OTHER']),
  description: z.string().optional(),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  minStock: z.number().int().nonnegative('Minimum stock cannot be negative').optional(),
  location: z.string().optional(),
  expirationDate: z.date().optional(),
})

const AppointmentCreateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  petId: z.string().min(1, 'Pet ID is required'),
  dateTime: z.date(),
  reason: z.string().min(1, 'Reason is required'),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
})

describe('Zod Model Validations', () => {
  describe('User validation', () => {
    it('should validate valid user data', () => {
      const validUser = {
        id: 'user-123',
        kindeId: 'kinde-456',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-234-567-8900',
        address: '123 Main St',
      }

      const result = UserCreateSchema.safeParse(validUser)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })

    it('should reject invalid email format', () => {
      const invalidUser = {
        id: 'user-123',
        kindeId: 'kinde-456',
        email: 'invalid-email',
      }

      const result = UserCreateSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format')
      }
    })

    it('should reject empty required fields', () => {
      const invalidUser = {
        id: '',
        kindeId: '',
      }

      const result = UserCreateSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it('should reject invalid phone format', () => {
      const invalidUser = {
        id: 'user-123',
        kindeId: 'kinde-456',
        phone: 'invalid-phone!@#',
      }

      const result = UserCreateSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid phone format')
      }
    })
  })

  describe('Pet validation', () => {
    it('should validate valid pet data', () => {
      const validPet = {
        id: 'pet-123',
        userId: 'user-456',
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        dateOfBirth: new Date('2020-01-01'),
        gender: 'MALE' as const,
        weight: 25.5,
        microchipNumber: '123456789',
        isNeutered: true,
        isDeceased: false,
      }

      const result = PetCreateSchema.safeParse(validPet)
      expect(result.success).toBe(true)
    })

    it('should reject negative weight', () => {
      const invalidPet = {
        id: 'pet-123',
        userId: 'user-456',
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        dateOfBirth: new Date('2020-01-01'),
        gender: 'MALE' as const,
        weight: -5,
      }

      const result = PetCreateSchema.safeParse(invalidPet)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Weight must be positive')
      }
    })

    it('should reject invalid gender', () => {
      const invalidPet = {
        id: 'pet-123',
        userId: 'user-456',
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        dateOfBirth: new Date('2020-01-01'),
        gender: 'UNKNOWN',
        weight: 25.5,
      }

      const result = PetCreateSchema.safeParse(invalidPet)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Gender must be MALE or FEMALE')
      }
    })
  })

  describe('InventoryItem validation', () => {
    it('should validate valid inventory item', () => {
      const validItem = {
        id: 'item-123',
        name: 'Dog Food Premium',
        category: 'FOOD' as const,
        description: 'High quality dog food',
        quantity: 50,
        minStock: 10,
        location: 'Warehouse A',
        expirationDate: new Date('2024-12-31'),
      }

      const result = InventoryItemCreateSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('should reject negative quantity', () => {
      const invalidItem = {
        id: 'item-123',
        name: 'Dog Food Premium',
        category: 'FOOD' as const,
        quantity: -5,
      }

      const result = InventoryItemCreateSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Quantity cannot be negative')
      }
    })

    it('should reject invalid category', () => {
      const invalidItem = {
        id: 'item-123',
        name: 'Dog Food Premium',
        category: 'INVALID_CATEGORY',
        quantity: 50,
      }

      const result = InventoryItemCreateSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
    })
  })

  describe('Appointment validation', () => {
    it('should validate valid appointment', () => {
      const validAppointment = {
        id: 'appointment-123',
        userId: 'user-456',
        petId: 'pet-789',
        dateTime: new Date('2024-02-15T10:00:00Z'),
        reason: 'Regular checkup',
        status: 'SCHEDULED' as const,
      }

      const result = AppointmentCreateSchema.safeParse(validAppointment)
      expect(result.success).toBe(true)
    })

    it('should reject empty reason', () => {
      const invalidAppointment = {
        id: 'appointment-123',
        userId: 'user-456',
        petId: 'pet-789',
        dateTime: new Date('2024-02-15T10:00:00Z'),
        reason: '',
        status: 'SCHEDULED' as const,
      }

      const result = AppointmentCreateSchema.safeParse(invalidAppointment)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Reason is required')
      }
    })

    it('should reject invalid status', () => {
      const invalidAppointment = {
        id: 'appointment-123',
        userId: 'user-456',
        petId: 'pet-789',
        dateTime: new Date('2024-02-15T10:00:00Z'),
        reason: 'Regular checkup',
        status: 'INVALID_STATUS',
      }

      const result = AppointmentCreateSchema.safeParse(invalidAppointment)
      expect(result.success).toBe(false)
    })
  })
}) 