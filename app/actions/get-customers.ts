// app/actions.ts
'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    })
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}