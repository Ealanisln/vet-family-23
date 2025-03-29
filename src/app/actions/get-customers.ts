// src/app/actions/get-customers.ts

"use server";

import { PrismaClient, Role, User } from "@prisma/client";
import { createKindeManagementAPIClient } from "@kinde-oss/kinde-auth-nextjs/server";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";

// Type guard for Prisma errors
function isPrismaError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

// Define better return types
type UserWithRoles = User & {
  roles: Role[];
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

// Implement a singleton pattern for PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export async function getUsers(): Promise<UserWithRoles[]> {
  try {
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return users.map((user) => ({
      ...user,
      roles: user.userRoles.map((ur) => ur.role),
      userRoles: undefined,
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
        pets: true,
        appointments: true,
        billings: true,
        reminders: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new ServerActionError("User not found", 404);
    }

    return {
      ...user,
      roles: user.userRoles.map((ur) => ur.role),
      userRoles: undefined,
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
        userRoles: {
          include: {
            role: true,
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
      roles: updatedUser.userRoles.map((ur) => ur.role),
      userRoles: undefined,
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
    const user = await prisma.$transaction(async (tx) => {
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
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!userWithRoles) {
      throw new ServerActionError("Failed to create user", 500);
    }

    return {
      ...userWithRoles,
      roles: userWithRoles.userRoles.map((ur) => ur.role),
      userRoles: undefined,
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

export async function deleteUser(userId: string): Promise<User> {
  try {
    // Delete user and all related data using cascade
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
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
