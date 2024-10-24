import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserNames() {
  try {
    // 1. Obtener todos los usuarios que tienen name
    const users = await prisma.user.findMany({
      where: {
        name: { not: null }
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true
      }
    })

    console.log(`Found ${users.length} users to update`)

    let updatedCount = 0
    let errorCount = 0

    // 2. Actualizar cada usuario
    for (const user of users) {
      if (!user.name?.trim()) continue

      try {
        // Dividir el nombre completo en partes y limpiar espacios extras
        const nameParts = user.name.trim().split(/\s+/)
        
        // Extraer firstName y lastName
        const firstName = nameParts[0]
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

        // Solo actualizar si los valores son diferentes
        if (user.firstName !== firstName || user.lastName !== lastName) {
          await prisma.user.update({
            where: {
              id: user.id
            },
            data: {
              firstName,
              lastName
            }
          })

          console.log(`✅ Usuario actualizado: ${user.name} -> "${firstName}" "${lastName}"`)
          updatedCount++
        }
      } catch (error) {
        console.error(`❌ Error actualizando usuario ${user.id}:`, error)
        errorCount++
      }
    }

    console.log('\nResumen del proceso:')
    console.log(`- Total de usuarios procesados: ${users.length}`)
    console.log(`- Usuarios actualizados: ${updatedCount}`)
    console.log(`- Errores encontrados: ${errorCount}`)
    console.log('¡Proceso de actualización completado!')

  } catch (error) {
    console.error('Error en el proceso:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Función auxiliar para verificar el resultado
async function verifyUpdates() {
  const sampleUsers = await prisma.user.findMany({
    take: 5,
    select: {
      name: true,
      firstName: true,
      lastName: true
    }
  })

  console.log('\nMuestra de usuarios actualizados:')
  console.log(JSON.stringify(sampleUsers, null, 2))
}

// Ejecutar las funciones si este archivo se ejecuta directamente
if (require.main === module) {
  updateUserNames()
    .then(() => verifyUpdates())
    .catch((error) => {
      console.error('Error en la ejecución:', error)
      process.exit(1)
    })
}