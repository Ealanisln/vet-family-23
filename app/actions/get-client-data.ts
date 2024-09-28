'use server'

import { PrismaClient } from '@prisma/client'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function getClientData() {
  const { getUser } = getKindeServerSession()
  const kindeUser = await getUser()

  if (!kindeUser || !kindeUser.id) {
    redirect('/api/auth/login')
  }

  try {
    const user = await prisma.user.findUnique({
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
      throw new Error('User not found')
    }

    // Transformar los datos para enviar solo la información necesaria al cliente
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
    }
  } catch (error) {
    console.error('Error fetching client data:', error)
    throw new Error('Failed to fetch client data')
  }
}