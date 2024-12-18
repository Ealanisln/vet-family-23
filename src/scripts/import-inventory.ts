import { PrismaClient, InventoryCategory, InventoryStatus, MovementType } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface AccessoryData {
  CANTIDAD: string
  NOMBRE: string
  SALIDA: string
  TOTAL: string
  'No.'?: string // Para los collares isabelinos
}

async function getAdminUser() {
  const adminUser = await prisma.user.findFirst({
    where: {
      id: '66f6148b4cd23e60e0bffb49'
    }
  })

  if (!adminUser) {
    throw new Error('No se encontró el usuario administrador')
  }

  return adminUser.id
}

function processIsabelineCollars(records: any[]): AccessoryData[] {
  const isabelineCollars: AccessoryData[] = []
  
  records.forEach(record => {
    if (record['NOMBRE']?.includes('COLLAR ISABELINO') && record['No.']) {
      isabelineCollars.push({
        CANTIDAD: record.CANTIDAD || '0',
        NOMBRE: `COLLAR ISABELINO #${record['No.']}`,
        SALIDA: record.SALIDA || '0',
        TOTAL: record.TOTAL || record.CANTIDAD || '0'
      })
    }
  })
  
  return isabelineCollars
}

async function importAccessoryInventory() {
  try {
    console.log('Iniciando proceso de importación de accesorios...')
    
    // Leer el archivo
    const filePath = path.join(process.cwd(), 'scripts/accesorios.csv')
    console.log('Buscando archivo en:', filePath)
    
    if (!fs.existsSync(filePath)) {
      console.error('ERROR: Archivo no encontrado')
      console.log('Archivos disponibles en el directorio:', fs.readdirSync(process.cwd()))
      return
    }

    // Leer y preprocesar el contenido
    let fileContent = fs.readFileSync(filePath, 'utf-8')
    // Eliminar las primeras líneas que contienen ",,,,", ",,ACCESORIOS ,,"
    fileContent = fileContent.split('\n').slice(2).join('\n')

    // Parsear el CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true
    })

    // Procesar los collares isabelinos por separado
    const isabelineCollars = processIsabelineCollars(records)
    
    // Combinar registros normales (excluyendo collares isabelinos duplicados) con los collares isabelinos procesados
    const allRecords = [
      ...records.filter((r: any) => !r['NOMBRE']?.includes('COLLAR ISABELINO')),
      ...isabelineCollars
    ] as AccessoryData[]

    console.log(`\nRegistros encontrados: ${allRecords.length}`)
    
    const adminId = await getAdminUser()
    console.log('ID del administrador:', adminId)

    for (const record of allRecords) {
      if (!record.NOMBRE || record.NOMBRE.trim() === '') {
        console.log('Saltando registro sin nombre')
        continue
      }

      const productName = record.NOMBRE.trim()
      console.log('\nProcesando producto:', productName)

      const initialQuantity = parseInt(record.CANTIDAD) || 0
      const outQuantity = parseInt(record.SALIDA) || 0
      const currentQuantity = record.TOTAL ? parseInt(record.TOTAL) : (initialQuantity - outQuantity)

      console.log({
        nombre: productName,
        cantidadInicial: initialQuantity,
        salidas: outQuantity,
        total: currentQuantity
      })

      try {
        // Crear item de inventario
        const inventoryItem = await prisma.inventoryItem.create({
          data: {
            name: productName,
            category: 'ACCESSORY' as InventoryCategory,
            quantity: currentQuantity,
            status: currentQuantity <= 0 ? 'OUT_OF_STOCK' : 
                   currentQuantity <= 2 ? 'LOW_STOCK' : 'ACTIVE',
            minStock: 2,
          },
        })

        console.log('Item creado:', inventoryItem.id)

        // Crear movimiento inicial si hay cantidad
        if (initialQuantity > 0) {
          const movement = await prisma.inventoryMovement.create({
            data: {
              itemId: inventoryItem.id,
              type: 'IN',
              quantity: initialQuantity,
              reason: 'Importación inicial del inventario de accesorios',
              userId: adminId,
            },
          })
          console.log('Movimiento de entrada creado:', movement.id)
        }

        // Crear movimiento de salida si existe
        if (outQuantity > 0) {
          const movement = await prisma.inventoryMovement.create({
            data: {
              itemId: inventoryItem.id,
              type: 'OUT',
              quantity: outQuantity,
              reason: 'Salida registrada en importación inicial',
              userId: adminId,
            },
          })
          console.log('Movimiento de salida creado:', movement.id)
        }

      } catch (error) {
        console.error('Error al procesar el producto:', productName, error)
      }
    }

    console.log('\nImportación completada')
  } catch (error) {
    console.error('Error durante la importación:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importAccessoryInventory()
  .catch((error) => {
    console.error('Error al importar el inventario:', error)
    process.exit(1)
  })