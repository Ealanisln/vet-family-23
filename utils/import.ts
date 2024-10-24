import { PrismaClient } from '@prisma/client'
import { parse as csvParse } from 'csv-parse/sync'
import { parse as parseDate, isValid } from 'date-fns'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface PetRecord {
  'NOMBRE DEL PROPIETARIO': string
  TELEFONO: string
  EMAIL: string
  DOMICILIO: string
  'Internal ID': string
  'NOMBRE DE LA MASCOTA': string
  ESPECIE: string
  GÉNERO: string
  RAZA: string
  'FECHA NAC.': string
  EDAD: string
  PESO: string
  ESTERILIZADO: string
  ENFERMEDAD: string
  'MOTIVO DE CONSULTA': string
  ESTADO: string
}

interface Client {
  name: string
  phone: string
  email: string
  address: string
  pets: PetRecord[]
}

// Utilidades de parseo seguras
const safeString = (value: any): string => {
  if (!value) return ''
  return String(value).trim()
}

const parseWeight = (weightStr: string): number => {
  if (!weightStr) return 0
  const cleanWeight = safeString(weightStr).toLowerCase()
    .replace('kg', '')
    .replace(',', '.')
    .trim()
  
  const weight = parseFloat(cleanWeight)
  return isNaN(weight) ? 0 : weight
}

const parseDateOfBirth = (dateStr: string, edad: string): Date => {
  if (dateStr) {
    try {
      const [day, month, year] = safeString(dateStr).split('/')
      if (day && month && year) {
        const date = parseDate(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date())
        if (isValid(date)) return date
      }
    } catch (e) {
      console.error(`Error parsing date: ${dateStr}`)
    }
  }

  if (edad) {
    const years = parseInt(safeString(edad).match(/\d+/)?.[0] || '0')
    if (years > 0) {
      const date = new Date()
      date.setFullYear(date.getFullYear() - years)
      return date
    }
  }

  return new Date()
}

const parseNeuteredStatus = (status: string): boolean => {
  if (!status) return false
  const normalizedStatus = safeString(status).toLowerCase()
  return normalizedStatus === 'si' || 
         normalizedStatus === 'sí' || 
         normalizedStatus === 'true'
}

const isDeceased = (estado: string): boolean => {
  if (!estado) return false
  const normalizedStatus = safeString(estado).toLowerCase()
  return normalizedStatus.includes('finado') || 
         normalizedStatus.includes('fallecido') || 
         normalizedStatus.includes('muerto')
}

// Función segura para generar ID de cliente
const generateClientId = (record: PetRecord): string => {
  const name = safeString(record['NOMBRE DEL PROPIETARIO'])
  const phone = safeString(record.TELEFONO)
  
  if (!name && !phone) {
    // Genera un ID aleatorio si no hay nombre ni teléfono
    return `unknown_client_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }
  
  const normalizedName = name.toLowerCase()
  const normalizedPhone = phone
  return `${normalizedName}_${normalizedPhone}`.replace(/[^a-z0-9_]/g, '')
}

async function importPetData() {
  try {
    const csvData = fs.readFileSync(path.join(process.cwd(), 'utils/data.csv'), 'utf-8')
    
    const records = csvParse(csvData, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      encoding: 'utf-8'
    }) as PetRecord[]

    // Agrupar registros por cliente
    const clientsMap = new Map<string, Client>()
    
    records.forEach(record => {
      // Validar registro
      if (!record['NOMBRE DE LA MASCOTA']) {
        console.log('Saltando registro sin nombre de mascota:', record)
        return
      }

      const clientId = generateClientId(record)
      
      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          name: safeString(record['NOMBRE DEL PROPIETARIO']) || 'Cliente Sin Nombre',
          phone: safeString(record.TELEFONO),
          email: safeString(record.EMAIL),
          address: safeString(record.DOMICILIO),
          pets: []
        })
      }
      
      clientsMap.get(clientId)?.pets.push(record)
    })

    console.log(`Iniciando importación de ${clientsMap.size} clientes...`)
    let importedClients = 0
    let importedPets = 0
    let errors = 0

    // Procesar cada cliente y sus mascotas
    for (const [clientId, clientData] of clientsMap) {
      try {
        // Crear el usuario
        const kindeId = `imported_${Date.now()}_${Math.random().toString(36).slice(2)}`
        const email = clientData.email || `${kindeId}@imported.temp`

        const user = await prisma.user.create({
          data: {
            kindeId,
            email,
            name: clientData.name || 'Cliente Sin Nombre',
            phone: clientData.phone || null,
            address: clientData.address || null,
            visits: 0,
            nextVisitFree: false
          }
        })

        // Procesar mascotas
        for (const petRecord of clientData.pets) {
          try {
            const pet = await prisma.pet.create({
              data: {
                userId: user.id,
                internalId: safeString(petRecord['Internal ID']),
                name: safeString(petRecord['NOMBRE DE LA MASCOTA']),
                species: safeString(petRecord.ESPECIE)?.toLowerCase() === 'felino' ? 'Felino' : 'Canino',
                breed: safeString(petRecord.RAZA) || 'No especificada',
                dateOfBirth: parseDateOfBirth(petRecord['FECHA NAC.'], petRecord.EDAD),
                gender: safeString(petRecord.GÉNERO) || 'No especificado',
                weight: parseWeight(petRecord.PESO),
                isNeutered: parseNeuteredStatus(petRecord.ESTERILIZADO),
                isDeceased: isDeceased(petRecord.ESTADO)
              }
            })

            if (petRecord.ENFERMEDAD || petRecord['MOTIVO DE CONSULTA']) {
              await prisma.medicalHistory.create({
                data: {
                  petId: pet.id,
                  visitDate: new Date(),
                  reasonForVisit: safeString(petRecord['MOTIVO DE CONSULTA']) || 'Consulta inicial',
                  diagnosis: safeString(petRecord.ENFERMEDAD) || 'No especificado',
                  treatment: 'Importado del sistema anterior',
                  prescriptions: [],
                  notes: petRecord.ESTADO ? `Estado: ${petRecord.ESTADO}` : undefined
                }
              })
            }

            importedPets++
            console.log(`  ✓ Mascota importada: ${petRecord['NOMBRE DE LA MASCOTA']}`)
          } catch (error) {
            errors++
            console.error(`  ✗ Error importando mascota:`, {
              mascota: petRecord['NOMBRE DE LA MASCOTA'],
              error: error instanceof Error ? error.message : 'Error desconocido'
            })
          }
        }

        importedClients++
        console.log(`✓ Cliente importado: ${clientData.name} (${clientData.pets.length} mascotas)`)
      } catch (error) {
        errors++
        console.error(`✗ Error importando cliente:`, {
          cliente: clientData.name,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }
    }

    console.log('\nResumen de importación:')
    console.log(`✓ Clientes importados: ${importedClients}`)
    console.log(`✓ Mascotas importadas: ${importedPets}`)
    console.log(`✗ Errores encontrados: ${errors}`)

  } catch (error) {
    console.error('Error general en la importación:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecución
console.log('Iniciando proceso de importación...')
importPetData()
  .then(() => console.log('Proceso completado'))
  .catch(console.error)