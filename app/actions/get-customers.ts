"use server";

import { PrismaClient } from "@prisma/client";
import { createKindeManagementAPIClient } from "@kinde-oss/kinde-auth-nextjs/server";

const prisma = new PrismaClient();

export async function getUsers(token: string) {
  try {
    // Here you would typically use the token to authenticate the request
    // For example, you might pass it as a header to an external API
    // or use it to verify the user's session

    // For now, we'll just log that we received a token

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        kindeId: true,
        name: true,
        address: true,
        preferredContactMethod: true,
        pet: true,
        visits: true,
        nextVisitFree: true,
        lastVisit: true,
        userRoles: {
          select: {
            role: {
              select: {
                key: true,
                name: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    // Transform the userRoles to match the previous format
    return users.map(user => ({
      ...user,
      roles: user.userRoles.map(ur => ur.role),
      userRoles: undefined, // Remove the userRoles field
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getUserById(id: string) {
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
      throw new Error("User not found");
    }
    // Transform the userRoles to match the previous format
    return {
      ...user,
      roles: user.userRoles.map(ur => ur.role),
      userRoles: undefined, // Remove the userRoles field
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}

export async function updateUser(userData: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  visits?: number;
  nextVisitFree?: boolean;
  internalId?: string;
}) {
  try {
    // Actualizar en la base de datos local
    const updatedUser = await prisma.user.update({
      where: { id: userData.id },
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        visits: userData.visits,
        nextVisitFree: userData.nextVisitFree,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Crear el cliente de la API de Kinde
    const { usersApi } = await createKindeManagementAPIClient();

    // Actualizar en Kinde (solo nombre y apellido)
    try {
      await usersApi.updateUser({
        id: userData.id,
        updateUserRequest: {
          givenName: userData.firstName,
          familyName: userData.lastName,
        },
      });
    } catch (kindeError) {
      console.error("Error updating user in Kinde:", kindeError);
      // Aquí podrías decidir si quieres lanzar un error o simplemente loggearlo
    }

    // Si el email ha cambiado, registra una advertencia
    if (updatedUser.email !== userData.email) {
      console.warn(
        `Email update for user ${userData.id} was not synced to Kinde. Local email: ${userData.email}, Kinde email may be different.`
      );
    }

    // Registra una advertencia para el teléfono
    console.warn(
      `Phone number for user ${userData.id} was updated locally but not in Kinde.`
    );

    // Transform the userRoles to match the previous format
    return {
      ...updatedUser,
      roles: updatedUser.userRoles.map(ur => ur.role),
      userRoles: undefined, // Remove the userRoles field
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}