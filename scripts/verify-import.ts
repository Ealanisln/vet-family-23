import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyVaccines() {
  try {
    // 1. Contar total de vacunas
    const totalVaccines = await prisma.inventoryItem.count({
      where: { 
        category: 'VACCINE',
        name: {
          contains: 'VAC',
          mode: 'insensitive'
        }
      }
    })

    console.log('\n=== Resumen de Vacunas ===')
    console.log(`Total de vacunas en inventario: ${totalVaccines}`)

    // 2. Obtener resumen de estados de vacunas
    const statusSummary = await prisma.inventoryItem.groupBy({
      by: ['status'],
      where: { 
        category: 'VACCINE',
        name: {
          contains: 'VAC',
          mode: 'insensitive'
        }
      },
      _count: true
    })

    console.log('\n=== Estado de las Vacunas ===')
    statusSummary.forEach(status => {
      console.log(`${status.status}: ${status._count} vacunas`)
    })

    // 3. Listar todas las vacunas específicamente
    const vaccines = await prisma.inventoryItem.findMany({
      where: { 
        category: 'VACCINE',
        name: {
          contains: 'VAC',
          mode: 'insensitive'
        }
      },
      select: {
        name: true,
        quantity: true,
        status: true,
        description: true,
        expirationDate: true,
        specialNotes: true,
        _count: {
          select: { movements: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    console.log('\n=== Detalle de Vacunas ===')
    vaccines.forEach(vaccine => {
      console.log(`
Nombre: ${vaccine.name}
Descripción: ${vaccine.description || 'No especificada'}
Cantidad: ${vaccine.quantity}
Estado: ${vaccine.status}
Fecha de caducidad: ${vaccine.expirationDate?.toLocaleDateString('es-ES') || 'No especificada'}
Notas especiales: ${vaccine.specialNotes || 'Ninguna'}
Movimientos registrados: ${vaccine._count.movements}
${'-'.repeat(50)}`)
    })

    // 4. Verificar movimientos específicos de vacunas
    const vaccineMovements = await prisma.inventoryMovement.findMany({
      where: {
        item: {
          category: 'VACCINE',
          name: {
            contains: 'VAC',
            mode: 'insensitive'
          }
        }
      },
      include: {
        item: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    console.log('\n=== Movimientos de Vacunas ===')
    vaccineMovements.forEach(movement => {
      console.log(`
Vacuna: ${movement.item.name}
Tipo: ${movement.type}
Cantidad: ${movement.quantity}
Fecha: ${movement.date.toLocaleDateString('es-ES')}
Razón: ${movement.reason}
${'-'.repeat(50)}`)
    })

  } catch (error) {
    console.error('Error al verificar las vacunas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyVaccines()
  .catch(console.error)