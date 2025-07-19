// app/actions/get-client-data.ts

import { Prisma } from "@prisma/client";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { cache } from 'react';
import crypto from 'crypto';
import { prisma } from "@/lib/prismaDB";

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
    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
          Pet: {
            select: {
              id: true,
              name: true,
              species: true,
            },
            where: {
              isDeceased: false, // Only get active pets by default
            },
          },
          Appointment: {
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
          UserRole: {
            select: {
              Role: {
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
            id: crypto.randomUUID(),
            kindeId: kindeUser.id,
            email: kindeUser.email ?? "",
            firstName: kindeUser.given_name ?? null,
            lastName: kindeUser.family_name ?? null,
            name: kindeUser.given_name && kindeUser.family_name
              ? `${kindeUser.given_name} ${kindeUser.family_name}`
              : null,
            updatedAt: new Date(),
            UserRole: {
              create: (permissions?.permissions || ["user"]).map((permission) => ({
                id: crypto.randomUUID(),
                Role: {
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
            Pet: {
              select: {
                id: true,
                name: true,
                species: true,
              },
              where: {
                isDeceased: false,
              },
            },
            Appointment: {
              select: {
                id: true,
                dateTime: true,
                reason: true,
              },
            },
            UserRole: {
              select: {
                Role: {
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
            UserRole: {
              deleteMany: {},
              create: (permissions?.permissions || []).map((permission) => ({
                id: crypto.randomUUID(),
                Role: {
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
            Pet: {
              select: {
                id: true,
                name: true,
                species: true,
              },
              where: {
                isDeceased: false,
              },
            },
            Appointment: {
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
            UserRole: {
              select: {
                Role: {
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
      pets: user.Pet.map((pet: { id: string; name: string; species: string }) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
      })),
      appointments: user.Appointment.map((appointment: { id: string; dateTime: Date; reason: string }) => ({
        id: appointment.id,
        dateTime: appointment.dateTime.toISOString(),
        reason: appointment.reason,
      })),
      roles: user.UserRole.map((userRole: { Role: { key: string } }) => userRole.Role.key),
    };
  } catch (error) {
    console.error("Error fetching client data:", error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      switch (prismaError.code) {
        case 'P2002':
          throw new Error('Duplicate user record found');
        case 'P2025':
          throw new Error('User record not found');
        default:
          throw new Error(`Database error: ${prismaError.code}`);
      }
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to fetch client data: ${error.message}`);
    }
    
    throw new Error("Failed to fetch client data: Unknown error");
  }
});