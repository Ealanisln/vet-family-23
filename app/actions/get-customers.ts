// get-customers.ts

"use server";

import { PrismaClient } from "@prisma/client";

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
        internalId: true,
        kindeId: true,
        name: true,
        address: true,
        preferredContactMethod: true,
        pet: true,
        visits: true,
        nextVisitFree: true,
        lastVisit: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
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
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
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
        internalId: userData.internalId,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}