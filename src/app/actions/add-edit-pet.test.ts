import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { addPet, updatePet, updatePetNeuteredStatus, updatePetDeceasedStatus } from './add-edit-pet';
import { revalidatePath } from 'next/cache';
import { jest } from '@jest/globals';

// Extend Jest with custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDefined(): R;
    }
  }
}

// Mock Next.js cache revalidation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock UUID generation
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

// Create mock data
const mockUserId = 'user-123';
const mockPetId = 'pet-123';
const mockPetData = {
  name: 'Max',
  species: 'Dog',
  breed: 'Labrador',
  dateOfBirth: new Date('2020-01-01'),
  gender: 'Male',
  weight: 25.5,
  isNeutered: false,
  microchipNumber: '123456789',
  medicalHistory: 'Healthy pet',
};

// Type for mocked functions
type MockPrismaClient = {
  user: {
    findUnique: jest.Mock;
  };
  pet: {
    create: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  medicalHistory: {
    create: jest.Mock;
    update: jest.Mock;
  };
  $transaction: jest.Mock;
};

// Create properly typed mock Prisma Client
const mockPrismaClient: MockPrismaClient = {
  user: {
    findUnique: jest.fn(),
  },
  pet: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  medicalHistory: {
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaClient)),
};

// Setup and teardown
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Pet Actions', () => {
  describe('addPet', () => {
    it('should successfully add a new pet', async () => {
      // Mock successful user lookup
      mockPrismaClient.user.findUnique.mockResolvedValueOnce({ id: mockUserId });

      // Mock successful pet creation
      mockPrismaClient.pet.create.mockResolvedValueOnce({
        ...mockPetData,
        id: mockPetId,
        userId: mockUserId,
        isDeceased: false,
        medicalHistory: [],
      });

      const result = await addPet(mockUserId, mockPetData);

      expect(result.success).toBe(true);
      expect(result.pet).toBeDefined();
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/clientes/${mockUserId}`);
    });

    it('should handle invalid user ID', async () => {
      const result = await addPet('', mockPetData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID provided');
    });

    it('should handle user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(null);

      const result = await addPet(mockUserId, mockPetData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should handle database errors', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce({ id: mockUserId });
      mockPrismaClient.pet.create.mockRejectedValueOnce(
        new PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '4.7.0',
        })
      );

      const result = await addPet(mockUserId, mockPetData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('A pet with this information already exists');
    });
  });

  describe('updatePet', () => {
    it('should successfully update a pet', async () => {
      mockPrismaClient.pet.findFirst.mockResolvedValueOnce({
        ...mockPetData,
        id: mockPetId,
        userId: mockUserId,
      });

      mockPrismaClient.pet.update.mockResolvedValueOnce({
        ...mockPetData,
        id: mockPetId,
        userId: mockUserId,
        medicalHistory: [],
      });

      const result = await updatePet(mockUserId, mockPetId, mockPetData);

      expect(result.success).toBe(true);
      expect(result.pet).toBeDefined();
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/clientes/${mockUserId}`);
    });

    it('should handle unauthorized pet update', async () => {
      mockPrismaClient.pet.findFirst.mockResolvedValueOnce(null);

      const result = await updatePet(mockUserId, mockPetId, mockPetData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pet not found or unauthorized');
    });
  });

  describe('updatePetNeuteredStatus', () => {
    it('should successfully update neutered status', async () => {
      mockPrismaClient.pet.update.mockResolvedValueOnce({
        ...mockPetData,
        id: mockPetId,
        userId: mockUserId,
        isNeutered: true,
      });

      const result = await updatePetNeuteredStatus(mockUserId, mockPetId, true);

      expect(result.success).toBe(true);
      expect(result.pet?.isNeutered).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/mascotas/${mockPetId}`);
    });

    it('should handle pet not found error', async () => {
      mockPrismaClient.pet.update.mockRejectedValueOnce(
        new Error('Record to update not found')
      );

      const result = await updatePetNeuteredStatus(mockUserId, mockPetId, true);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pet not found or unauthorized');
    });
  });

  describe('updatePetDeceasedStatus', () => {
    it('should successfully update deceased status', async () => {
      mockPrismaClient.pet.update.mockResolvedValueOnce({
        ...mockPetData,
        id: mockPetId,
        userId: mockUserId,
        isDeceased: true,
      });

      const result = await updatePetDeceasedStatus(mockUserId, mockPetId, true);

      expect(result.success).toBe(true);
      expect(result.pet?.isDeceased).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/mascotas/${mockPetId}`);
    });

    it('should handle pet not found error', async () => {
      mockPrismaClient.pet.update.mockRejectedValueOnce(
        new Error('Record to update not found')
      );

      const result = await updatePetDeceasedStatus(mockUserId, mockPetId, true);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pet not found or unauthorized');
    });
  });
});