// src/app/actions/get-customers.ts

"use server";

import { createKindeManagementAPIClient } from "@kinde-oss/kinde-auth-nextjs/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";

// Type guard for Prisma errors
function isPrismaError(
  error: unknown
): error is { code: string } {
  return error !== null && typeof error === 'object' && 'code' in error;
}

// Define better return types
type UserWithRoles = {
  id: string;
  kindeId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  preferredContactMethod: string | null;
  pet: string | null;
  visits: number;
  nextVisitFree: boolean;
  lastVisit: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    id: string;
    key: string;
    name: string;
  }>;
};

// Custom error class
class ServerActionError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ServerActionError";
  }
}

// Type for User with included relations
type UserWithIncludedRoles = {
  id: string;
  kindeId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  preferredContactMethod: string | null;
  pet: string | null;
  visits: number;
  nextVisitFree: boolean;
  lastVisit: Date | null;
  createdAt: Date;
  updatedAt: Date;
  UserRole: Array<{
    id: string;
    userId: string;
    roleId: string;
    Role: {
      id: string;
      key: string;
      name: string;
    };
  }>;
};

// Type for UserRole relation
type UserRoleWithRole = {
  id: string;
  userId: string;
  roleId: string;
  Role: {
    id: string;
    key: string;
    name: string;
  };
};

export async function getUsers(): Promise<UserWithRoles[]> {
  try {
    const users = await prisma.user.findMany({
      include: {
        UserRole: {
          include: {
            Role: true,
          },
        },
      },
    });

    return users.map((user: UserWithIncludedRoles) => ({
      ...user,
      roles: user.UserRole.map((ur) => ur.Role),
      UserRole: undefined,
    })) as UserWithRoles[];
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    throw new ServerActionError("Failed to fetch users");
  }
}

export async function getUserById(id: string): Promise<UserWithRoles> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        Pet: true,
        Appointment: true,
        Billing: true,
        Reminder: true,
        UserRole: {
          include: {
            Role: true,
          },
        },
      },
    });

    if (!user) {
      throw new ServerActionError("User not found", 404);
    }

    return {
      ...user,
      roles: user.UserRole.map((ur: UserRoleWithRole) => ur.Role),
      UserRole: undefined,
    } as UserWithRoles;
  } catch (error: unknown) {
    if (error instanceof ServerActionError) throw error;
    console.error("Error fetching user:", error);
    throw new ServerActionError("Failed to fetch user");
  }
}

interface UpdateUserData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  visits?: number;
  nextVisitFree?: boolean;
}

export async function updateUser(
  userData: UpdateUserData
): Promise<UserWithRoles> {
  try {
    // Validate input
    if (!userData.id) {
      throw new ServerActionError("User ID is required", 400);
    }

    // Update in the local database
    const updatedUser = await prisma.user.update({
      where: { id: userData.id },
      data: {
        ...(userData.firstName && { firstName: userData.firstName }),
        ...(userData.lastName && { lastName: userData.lastName }),
        ...(userData.email && { email: userData.email }),
        ...(userData.phone && { phone: userData.phone }),
        ...(userData.address && { address: userData.address }),
        ...(userData.visits !== undefined && { visits: userData.visits }),
        ...(userData.nextVisitFree !== undefined && {
          nextVisitFree: userData.nextVisitFree,
        }),
      },
      include: {
        UserRole: {
          include: {
            Role: true,
          },
        },
      },
    });

    // Update in Kinde if name fields are provided
    if (userData.firstName || userData.lastName) {
      try {
        const { usersApi } = await createKindeManagementAPIClient();
        await usersApi.updateUser({
          id: userData.id,
          updateUserRequest: {
            ...(userData.firstName && { givenName: userData.firstName }),
            ...(userData.lastName && { familyName: userData.lastName }),
          },
        });
      } catch (kindeError) {
        console.error("Error updating user in Kinde:", kindeError);
      }
    }

    return {
      ...updatedUser,
      roles: updatedUser.UserRole.map((ur: UserRoleWithRole) => ur.Role),
      UserRole: undefined,
    } as UserWithRoles;
  } catch (error: unknown) {
    if (error instanceof ServerActionError) throw error;
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        throw new ServerActionError("User not found", 404);
      }
    }
    console.error("Error updating user:", error);
    throw new ServerActionError("Failed to update user");
  }
}

interface CreateUserData {
  kindeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  name?: string | null;
  roles?: string[];
}

export async function createUser(
  userData: CreateUserData
): Promise<UserWithRoles> {
  try {
    // Input validation
    if (!userData.kindeId || !userData.email) {
      throw new ServerActionError("KindeId and email are required", 400);
    }

    // Create or get roles if provided
    const roleIds = userData.roles
      ? await Promise.all(
          userData.roles.map(async (roleKey) => {
            const role = await prisma.role.upsert({
              where: { key: roleKey },
              update: {},
              create: {
                id: randomUUID(),
                key: roleKey,
                name:
                  roleKey.charAt(0).toUpperCase() +
                  roleKey.slice(1).toLowerCase(),
              },
            });
            return role.id;
          })
        )
      : [];

    // Create user with transaction to ensure atomicity
    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          id: randomUUID(),
          kindeId: userData.kindeId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          name: userData.name,
          updatedAt: new Date(),
        },
      });

      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({
            id: randomUUID(),
            userId: newUser.id,
            roleId: roleId,
          })),
        });
      }

      return newUser;
    });

    // Fetch the complete user with roles
    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        UserRole: {
          include: {
            Role: true,
          },
        },
      },
    });

    if (!userWithRoles) {
      throw new ServerActionError("Failed to create user", 500);
    }

    return {
      ...userWithRoles,
      roles: userWithRoles.UserRole.map((ur: UserRoleWithRole) => ur.Role),
      UserRole: undefined,
    } as UserWithRoles;
  } catch (error: unknown) {
    if (error instanceof ServerActionError) throw error;
    if (isPrismaError(error)) {
      if (error.code === "P2002") {
        throw new ServerActionError(
          "User with this kindeId already exists",
          409
        );
      }
    }
    console.error("Error creating user:", error);
    throw new ServerActionError("Failed to create user");
  }
}

export async function deleteUser(userId: string): Promise<{ id: string }> {
  try {
    // Delete user and all related data using cascade
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      select: { id: true },
    });

    return deletedUser;
  } catch (error: unknown) {
    if (error instanceof ServerActionError) throw error;
    if (isPrismaError(error) && error.code === "P2025") {
      throw new ServerActionError("User not found", 404);
    }
    console.error("Error deleting user:", error);
    throw new ServerActionError("Failed to delete user");
  }
}
