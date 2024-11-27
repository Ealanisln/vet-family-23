"use server";

import { PrismaClient, Staff } from "@prisma/client";
import { createKindeManagementAPIClient } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

// Interfaces
interface Pet {
  id: string;
  name: string;
  species: string;
  isDeceased: boolean;
  internalId?: string | null;
}

// Extendemos de Partial<Staff> para hacer todos los campos opcionales
interface StaffResponse {
  id: string;
  address: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  internalId: string | null;
  kindeId: string;
  name: string | null;
  nextVisitFree: boolean;
  phone: string | null;
  visits: number;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  pets: Pet[];
}

interface CreateStaffInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  kindeId: string;
  visits?: number;
  nextVisitFree?: boolean;
}

interface UpdateStaffInput {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  visits?: number;
  nextVisitFree?: boolean;
  internalId?: string;
}

// PrismaClient initialization
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const transformStaffResponse = (staff: any): StaffResponse => ({
  ...staff,
  visits: Number(staff.visits),
  roles: staff.roles,
  pets: staff.pets || []
});

export async function getUsers(token: string): Promise<StaffResponse[]> {
  try {
    const staff = await prisma.staff.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        kindeId: true,
        name: true,
        address: true,
        visits: true,
        nextVisitFree: true,
        createdAt: true,
        updatedAt: true,
        internalId: true,
        roles: true,
        pets: {
          select: {
            id: true,
            name: true,
            species: true,
            isDeceased: true,
            internalId: true
          }
        }
      },
    });

    return staff.map(transformStaffResponse);
  } catch (error) {
    console.error("Error fetching staff:", error instanceof Error ? error.message : error);
    throw new Error("Failed to fetch staff");
  }
}

export async function getUserById(id: string): Promise<StaffResponse> {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        kindeId: true,
        name: true,
        address: true,
        visits: true,
        nextVisitFree: true,
        createdAt: true,
        updatedAt: true,
        internalId: true,
        roles: true,
        pets: {
          select: {
            id: true,
            name: true,
            species: true,
            isDeceased: true,
            internalId: true
          }
        }
      },
    });
    
    if (!staff) {
      throw new Error("Staff member not found");
    }
    
    return transformStaffResponse(staff);
  } catch (error) {
    console.error("Error fetching staff member:", error instanceof Error ? error.message : error);
    throw new Error("Failed to fetch staff member");
  }
}

export async function updateUser(userData: UpdateStaffInput): Promise<StaffResponse> {
  try {
    const updatedStaff = await prisma.staff.update({
      where: { id: userData.id },
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        visits: BigInt(userData.visits || 0),
        nextVisitFree: userData.nextVisitFree,
        updatedAt: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        kindeId: true,
        name: true,
        address: true,
        visits: true,
        nextVisitFree: true,
        createdAt: true,
        updatedAt: true,
        internalId: true,
        roles: true,
        pets: {
          select: {
            id: true,
            name: true,
            species: true,
            isDeceased: true,
            internalId: true
          }
        }
      },
    });

    const { usersApi } = await createKindeManagementAPIClient();

    try {
      await usersApi.updateUser({
        id: userData.id,
        updateUserRequest: {
          givenName: userData.firstName,
          familyName: userData.lastName,
        },
      });
    } catch (kindeError) {
      console.error("Error updating user in Kinde:", kindeError instanceof Error ? kindeError.message : kindeError);
    }

    if (updatedStaff.email !== userData.email) {
      console.warn(
        `Email update for user ${userData.id} was not synced to Kinde. Local email: ${userData.email}, Kinde email may be different.`
      );
    }

    revalidatePath("/admin/customers");

    return transformStaffResponse(updatedStaff);
  } catch (error) {
    console.error("Error updating staff member:", error instanceof Error ? error.message : error);
    throw new Error("Failed to update staff member");
  }
}

export async function createUser(userData: CreateStaffInput): Promise<StaffResponse> {
  try {
    const newStaff = await prisma.staff.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        kindeId: userData.kindeId,
        visits: BigInt(userData.visits || 0),
        nextVisitFree: userData.nextVisitFree || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: []
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        kindeId: true,
        name: true,
        address: true,
        visits: true,
        nextVisitFree: true,
        createdAt: true,
        updatedAt: true,
        internalId: true,
        roles: true,
        pets: {
          select: {
            id: true,
            name: true,
            species: true,
            isDeceased: true,
            internalId: true
          }
        }
      },
    });

    revalidatePath("/admin/customers");

    return transformStaffResponse(newStaff);
  } catch (error) {
    console.error("Error creating staff member:", error instanceof Error ? error.message : error);
    throw new Error("Failed to create staff member");
  }
}

export async function deleteUser(id: string): Promise<Staff> {
  try {
    const deletedStaff = await prisma.staff.delete({
      where: { id }
    });

    const { usersApi } = await createKindeManagementAPIClient();

    try {
      await usersApi.deleteUser({ id });
    } catch (kindeError) {
      console.error("Error deleting user in Kinde:", kindeError instanceof Error ? kindeError.message : kindeError);
    }

    revalidatePath("/admin/customers");

    return deletedStaff;
  } catch (error) {
    console.error("Error deleting staff member:", error instanceof Error ? error.message : error);
    throw new Error("Failed to delete staff member");
  }
}

export async function searchUsers(searchTerm: string): Promise<StaffResponse[]> {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        kindeId: true,
        name: true,
        address: true,
        visits: true,
        nextVisitFree: true,
        createdAt: true,
        updatedAt: true,
        internalId: true,
        roles: true,
        pets: {
          select: {
            id: true,
            name: true,
            species: true,
            isDeceased: true,
            internalId: true
          }
        }
      },
    });

    return staff.map(transformStaffResponse);
  } catch (error) {
    console.error("Error searching staff members:", error instanceof Error ? error.message : error);
    throw new Error("Failed to search staff members");
  }
}