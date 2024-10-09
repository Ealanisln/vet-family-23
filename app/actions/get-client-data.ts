import { PrismaClient } from '@prisma/client'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function getClientData() {
  const { getUser, getPermissions } = getKindeServerSession()
  const kindeUser = await getUser()
  const permissions = await getPermissions()

  if (!kindeUser || !kindeUser.id) {
    redirect('/api/auth/login')
  }

  try {
    let user = await prisma.user.findUnique({
      where: { kindeId: kindeUser.id },
      include: {
        pets: true,
        appointments: {
          where: {
            dateTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            dateTime: 'asc',
          },
        },
        billings: true,
        reminders: true,
      },
    })

    if (!user) {
      console.log('User not found in local database, creating new user')
      user = await prisma.user.create({
        data: {
          kindeId: kindeUser.id,
          email: kindeUser.email || '',
          firstName: kindeUser.given_name || null,
          lastName: kindeUser.family_name || null,
          name: kindeUser.given_name && kindeUser.family_name ? `${kindeUser.given_name} ${kindeUser.family_name}` : null,
          roles: permissions?.permissions || ['user'], // Use permissions instead of roles
          pets: { create: [] },
          appointments: { create: [] },
          billings: { create: [] },
          reminders: { create: [] },
        },
        include: {
          pets: true,
          appointments: true,
          billings: true,
          reminders: true,
        },
      })
    } else {
      // Update user information if it exists
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: kindeUser.email || undefined,
          firstName: kindeUser.given_name || undefined,
          lastName: kindeUser.family_name || undefined,
          name: kindeUser.given_name && kindeUser.family_name ? `${kindeUser.given_name} ${kindeUser.family_name}` : undefined,
          roles: permissions?.permissions || undefined, // Update roles with permissions
        },
        include: {
          pets: true,
          appointments: {
            where: {
              dateTime: {
                gte: new Date(),
              },
            },
            orderBy: {
              dateTime: 'asc',
            },
          },
          billings: true,
          reminders: true,
        },
      })
    }

    // Transform the data to send only the necessary information to the client
    return {
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      visits: user.visits,
      nextVisitFree: user.nextVisitFree,
      pets: user.pets.map(pet => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
      })),
      appointments: user.appointments.map(appointment => ({
        id: appointment.id,
        dateTime: appointment.dateTime.toISOString(),
        reason: appointment.reason,
      })),
      roles: user.roles,
    }
  } catch (error) {
    console.error('Error fetching client data:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch client data: ${error.message}`)
    } else {
      throw new Error('Failed to fetch client data: Unknown error')
    }
  } finally {
    await prisma.$disconnect()
  }
}