// app/actions/get-client-data.ts

import { PrismaClient, Prisma, User } from "@prisma/client";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { cache } from 'react';

// Define return type for better type safety
interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  visits: number;
  nextVisitFree: boolean;
  pets: Array<{
    id: string;
    name: string;
    species: string;
  }>;
  appointments: Array<{
    id: string;
    dateTime: string;
    reason: string;
  }>;
  roles: string[];
}

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient();

// Cache the getClientData function to avoid unnecessary database calls
export const getClientData = cache(async (): Promise<ClientData> => {
  const { getUser, getPermissions } = getKindeServerSession();
  const kindeUser = await getUser();
  const permissions = await getPermissions();

  if (!kindeUser?.id) {
    redirect("/api/auth/login");
  }

  try {
    // Use a transaction for atomicity
    const user = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { kindeId: kindeUser.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          visits: true,
          nextVisitFree: true,
          pets: {
            select: {
              id: true,
              name: true,
              species: true,
            },
            where: {
              isDeceased: false, // Only get active pets by default
            },
          },
          appointments: {
            select: {
              id: true,
              dateTime: true,
              reason: true,
            },
            where: {
              dateTime: {
                gte: new Date(),
              },
            },
            orderBy: {
              dateTime: 'asc',
            },
            take: 10, // Limit to next 10 appointments for performance
          },
          userRoles: {
            select: {
              role: {
                select: {
                  key: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        // Create new user with optimized query
        user = await tx.user.create({
          data: {
            id: crypto.randomUUID(), // Generate UUID for PostgreSQL
            kindeId: kindeUser.id,
            email: kindeUser.email ?? "",
            firstName: kindeUser.given_name ?? null,
            lastName: kindeUser.family_name ?? null,
            name: kindeUser.given_name && kindeUser.family_name
              ? `${kindeUser.given_name} ${kindeUser.family_name}`
              : null,
            userRoles: {
              create: (permissions?.permissions || ["user"]).map((permission) => ({
                role: {
                  connectOrCreate: {
                    where: { key: permission },
                    create: { 
                      id: crypto.randomUUID(),
                      key: permission, 
                      name: permission 
                    },
                  },
                },
              })),
            },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            visits: true,
            nextVisitFree: true,
            pets: {
              select: {
                id: true,
                name: true,
                species: true,
              },
            },
            appointments: {
              select: {
                id: true,
                dateTime: true,
                reason: true,
              },
            },
            userRoles: {
              select: {
                role: {
                  select: {
                    key: true,
                  },
                },
              },
            },
          },
        });
      } else {
        // Update existing user with optimized query
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            email: kindeUser.email ?? undefined,
            firstName: kindeUser.given_name ?? undefined,
            lastName: kindeUser.family_name ?? undefined,
            name: kindeUser.given_name && kindeUser.family_name
              ? `${kindeUser.given_name} ${kindeUser.family_name}`
              : undefined,
            userRoles: {
              deleteMany: {},
              create: (permissions?.permissions || []).map((permission) => ({
                role: {
                  connectOrCreate: {
                    where: { key: permission },
                    create: {
                      id: crypto.randomUUID(),
                      key: permission,
                      name: permission,
                    },
                  },
                },
              })),
            },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            visits: true,
            nextVisitFree: true,
            pets: {
              select: {
                id: true,
                name: true,
                species: true,
              },
              where: {
                isDeceased: false,
              },
            },
            appointments: {
              select: {
                id: true,
                dateTime: true,
                reason: true,
              },
              where: {
                dateTime: {
                  gte: new Date(),
                },
              },
              orderBy: {
                dateTime: 'asc',
              },
              take: 10,
            },
            userRoles: {
              select: {
                role: {
                  select: {
                    key: true,
                  },
                },
              },
            },
          },
        });
      }

      return user;
    });

    // Transform the data with null safety
    return {
      id: user.id,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      visits: user.visits,
      nextVisitFree: user.nextVisitFree,
      pets: user.pets.map((pet) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
      })),
      appointments: user.appointments.map((appointment) => ({
        id: appointment.id,
        dateTime: appointment.dateTime.toISOString(),
        reason: appointment.reason,
      })),
      roles: user.userRoles.map((userRole) => userRole.role.key),
    };
  } catch (error) {
    console.error("Error fetching client data:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new Error('Duplicate user record found');
        case 'P2025':
          throw new Error('User record not found');
        default:
          throw new Error(`Database error: ${error.code}`);
      }
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to fetch client data: ${error.message}`);
    }
    
    throw new Error("Failed to fetch client data: Unknown error");
  }
});