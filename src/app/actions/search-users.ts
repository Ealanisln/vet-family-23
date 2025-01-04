"use server";

import { prisma } from "@/lib/prismaDB";

export async function searchUsers(query: string) {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            firstName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
      },
      take: 10,
    });

    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    throw new Error("Error al buscar usuarios");
  }
}
