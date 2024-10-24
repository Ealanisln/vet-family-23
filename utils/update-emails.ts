import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateTempEmails() {
  try {
    // Buscar usuarios con correos temporales
    const result = await prisma.user.updateMany({
      where: {
        email: {
          contains: '@imported.temp'
        }
      },
      data: {
        email: 'n/a'
      }
    })

    console.log(`✓ Actualización completada: ${result.count} correos actualizados`)
  } catch (error) {
    console.error('Error actualizando correos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar actualización
console.log('Iniciando actualización de correos temporales...')
updateTempEmails()
  .then(() => console.log('Proceso completado'))
  .catch(console.error)