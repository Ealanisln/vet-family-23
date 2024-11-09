import { PrismaClient } from '@prisma/client'
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
  if (!dateStr) return null
  
  // Handle different date formats
  const formats = [
    // mm/dd/yyyy
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // mm-dd-yyyy
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    // mmm-yy
    /^([a-zA-Z]{3})-(\d{2})$/,
    // d-mmm-yy
    /^(\d{1,2})-([a-zA-Z]{3})-(\d{2})$/
  ]

  for (const format of formats) {
    const match = dateStr.match(format)
    if (match) {
      if (match.length === 3) {
        // Handle mmm-yy format
        const month = new Date(Date.parse(`${match[1]} 1, 2000`)).getMonth()
        const year = 2000 + parseInt(match[2])
        return new Date(year, month, 1)
      } else if (match.length === 4) {
        const year = match[3].length === 2 ? 2000 + parseInt(match[3]) : parseInt(match[3])
        if (format.source.includes('mmm')) {
          // Handle d-mmm-yy format
          const month = new Date(Date.parse(`${match[2]} 1, 2000`)).getMonth()
          return new Date(year, month, parseInt(match[1]))
        } else {
          // Handle mm/dd/yyyy format
          return new Date(year, parseInt(match[1]) - 1, parseInt(match[2]))
        }
      }
    }
  }
  
  return null
}

const mapVaccineTypeToEnum = (vaccineName: string): string => {
  const nameUpper = vaccineName.toUpperCase()
  if (nameUpper.includes('DP PUPPY')) return 'DP_PUPPY'
  if (nameUpper.includes('DHPPI')) return 'DHPPI'
  if (nameUpper.includes('BORDETELLA')) return 'BORDETELLA'
  if (nameUpper.includes('RABIA')) return 'RABIES'
  // Add more mappings as needed
  return 'DHPPI' // Default value
}

async function importInventory() {
  try {
    // Read and parse CSV file
    const fileContent = fs.readFileSync(path.join(process.cwd(), 'scripts', 'data.csv'))
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as VaccineData[]

    console.log(`Found ${records.length} records to process`)

    const results = {
      created: 0,
      skipped: 0,
      updated: 0,
      errors: 0,
    }

    // Process each record
    for (const record of records) {
      if (!record['NOMBRE VACUNA']) continue

      const vaccineName = record['NOMBRE VACUNA'].trim()
      const quantity = parseInt(record.CANTIDAD) || 0
      const expirationDate = record['CAD VAC'] ? parseDate(record['CAD VAC']) : null
      const diluentExpirationDate = record['FECHA CAD DILUENTE'] ? parseDate(record['FECHA CAD DILUENTE']) : null

      try {
        // Check if vaccine already exists
        const existingVaccine = await prisma.inventoryItem.findFirst({
          where: {
            name: {
              equals: vaccineName,
              mode: 'insensitive'
            },
            category: 'VACCINE'
          }
        })

        if (existingVaccine) {
          // If exists with same expiration date, skip
          if (existingVaccine.expirationDate?.toISOString() === expirationDate?.toISOString()) {
            console.log(`Skipping duplicate: ${vaccineName}`)
            results.skipped++
            continue
          }

          // If exists but with different expiration date, create new batch
          console.log(`Creating new batch for: ${vaccineName}`)
          results.created++
        }

        // Create inventory item
        const inventoryItem = await prisma.inventoryItem.create({
          data: {
            name: vaccineName,
            category: 'VACCINE',
            description: record.FORMULA || null,
            quantity: quantity,
            status: quantity > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
            expirationDate: expirationDate,
            specialNotes: diluentExpirationDate ? 
              `Diluent expiration date: ${diluentExpirationDate.toISOString()}` : null,
            minStock: 2,
          },
        })

        // Create initial inventory movement
        if (quantity > 0) {
          await prisma.inventoryMovement.create({
            data: {
              itemId: inventoryItem.id,
              type: 'IN',
              quantity: quantity,
              reason: 'Initial import',
              userId: 'SYSTEM', // Reemplazar con un ID válido
            },
          })
        }

        results.created++
        console.log(`Imported: ${vaccineName} - Quantity: ${quantity}`)
      } catch (error) {
        console.error(`Error processing ${vaccineName}:`, error)
        results.errors++
      }
    }

    console.log('\n=== Import Summary ===')
    console.log(`Created: ${results.created}`)
    console.log(`Skipped duplicates: ${results.skipped}`)
    console.log(`Errors: ${results.errors}`)

  } catch (error) {
    console.error('Error during import:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importInventory()
  .catch((error) => {
    console.error('Failed to import inventory:', error)
    process.exit(1)
  })