import { PrismaClient, InventoryCategory, InventoryStatus, MovementType } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface VaccineData {
  CANTIDAD: string
  'NOMBRE VACUNA': string
  FORMULA: string
  'FECHA CAD DILUENTE': string
  'CAD VAC': string
  SALIDA: string
  TOTAL: string
}

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.trim() === '') return null
  
  const months: { [key: string]: string } = {
    'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 
    'may': '05', 'jun': '06', 'jul': '07', 'ago': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
  }

  // Normalizar el string de fecha
  dateStr = dateStr.toLowerCase().trim()

  // Formato: mm/dd/yyyy
  if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return new Date(dateStr)
  }

  // Formato: d-mmm-yy
  const monthFormat = /^(\d{1,2})-([a-zá-ú]{3})-(\d{2})$/
  const monthMatch = dateStr.match(monthFormat)
  if (monthMatch) {
    const [_, day, month, year] = monthMatch
    const monthNum = months[month] || '01'
    return new Date(`20${year}-${monthNum}-${day.padStart(2, '0')}`)
  }

  // Formato: mmm-yy
  const shortFormat = /^([a-zá-ú]{3})-(\d{2})$/
  const shortMatch = dateStr.match(shortFormat)
  if (shortMatch) {
    const [_, month, year] = shortMatch
    const monthNum = months[month] || '01'
    return new Date(`20${year}-${monthNum}-01`)
  }

  return null
}

async function getOrCreateSystemUser() {
  const systemUser = await prisma.user.findFirst({
    where: {
      email: 'system@veterinaria.local'
    }
  })

  if (systemUser) return systemUser.id

  const newSystemUser = await prisma.user.create({
    data: {
      kindeId: 'system-user',
      email: 'system@veterinaria.local',
      name: 'System',
    }
  })

  return newSystemUser.id
}

async function importInventory() {
  try {
    console.log('Iniciando proceso de importación...')
    
    // Leer el archivo
    const filePath = path.join(process.cwd(), 'scripts/data.csv')
    console.log('Buscando archivo en:', filePath)
    
    if (!fs.existsSync(filePath)) {
      console.error('ERROR: Archivo no encontrado')
      console.log('Archivos disponibles en el directorio:', fs.readdirSync(process.cwd()))
      return
    }

    // Leer y preprocesar el contenido
    let fileContent = fs.readFileSync(filePath, 'utf-8')
    // Eliminar la primera línea que contiene ",,VACUNAS,,,,"
    fileContent = fileContent.split('\n').slice(1).join('\n')

    // Parsear el CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true
    }) as VaccineData[]

    console.log(`\nRegistros encontrados: ${records.length}`)
    
    const systemUserId = await getOrCreateSystemUser()
    console.log('ID de usuario del sistema:', systemUserId)

    for (const record of records) {
      if (!record['NOMBRE VACUNA'] || record['NOMBRE VACUNA'].trim() === '') {
        console.log('Saltando registro sin nombre de vacuna')
        continue
      }

      const vaccineName = record['NOMBRE VACUNA'].trim()
      console.log('\nProcesando vacuna:', vaccineName)

      const initialQuantity = parseInt(record.CANTIDAD) || 0
      const outQuantity = parseInt(record.SALIDA) || 0
      const currentQuantity = record.TOTAL ? parseInt(record.TOTAL) : (initialQuantity - outQuantity)

      console.log({
        nombre: vaccineName,
        cantidadInicial: initialQuantity,
        salidas: outQuantity,
        total: currentQuantity,
        fechaCaducidad: record['CAD VAC'],
        fechaDiluente: record['FECHA CAD DILUENTE']
      })

      try {
        const expirationDate = parseDate(record['CAD VAC'])
        const diluentDate = parseDate(record['FECHA CAD DILUENTE'])

        // Crear item de inventario
        const inventoryItem = await prisma.inventoryItem.create({
          data: {
            name: vaccineName,
            category: 'VACCINE',
            description: record.FORMULA || null,
            quantity: currentQuantity,
            status: currentQuantity <= 0 ? 'OUT_OF_STOCK' : 
                   currentQuantity <= 2 ? 'LOW_STOCK' : 'ACTIVE',
            expirationDate,
            specialNotes: diluentDate ? 
              `Diluente caduca: ${diluentDate.toLocaleDateString('es-ES')}` : null,
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
              reason: 'Importación inicial del inventario',
              userId: systemUserId,
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
              userId: systemUserId,
            },
          })
          console.log('Movimiento de salida creado:', movement.id)
        }

      } catch (error) {
        console.error('Error al procesar la vacuna:', vaccineName, error)
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

importInventory()
  .catch((error) => {
    console.error('Error al importar el inventario:', error)
    process.exit(1)
  })