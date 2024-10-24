import { PrismaClient } from '@prisma/client'
import { parse } from 'date-fns'

const prisma = new PrismaClient()

interface RawPetRecord {
  nombrePropietario: string
  telefono: string
  domicilio: string
  internalId: string
  nombreMascota: string
  especie: string
  genero: string
  raza: string
  fechaNacimiento: string
  edad: string
  peso: string
  esterilizado: string
  enfermedad: string
  motivoConsulta: string
  estado: string
}

// Utility functions for data parsing
const parseWeight = (weightStr: string): number => {
  if (!weightStr) return 0
  const numericWeight = weightStr.replace(/[^\d.,]/g, '').replace(',', '.')
  return parseFloat(numericWeight) || 0
}

const parseDateOfBirth = (dateStr: string, edad: string): Date => {
  if (dateStr && dateStr.includes('/')) {
    try {
      return parse(dateStr, 'dd/MM/yyyy', new Date())
    } catch (e) {
      console.error(`Error parsing date: ${dateStr}`)
    }
  }
  
  // If no valid date, estimate from age
  const currentDate = new Date()
  const ageMatch = edad.match(/\d+/)
  if (ageMatch) {
    const years = parseInt(ageMatch[0])
    return new Date(currentDate.getFullYear() - years, currentDate.getMonth(), currentDate.getDate())
  }
  
  return new Date()
}

const parseNeuteredStatus = (status: string): boolean => {
  return status.toLowerCase().includes('si') || status.toLowerCase().includes('sí')
}

// Generate a unique email from the phone number
const generateUniqueEmail = (phone: string, name: string): string => {
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const uniqueId = Math.random().toString(36).substring(2, 8)
  return `${sanitizedName}_${phone}_${uniqueId}@imported.temp`
}

// Main import function
export async function importPetData(rawData: string) {
  try {
    // Parse CSV data
    const records = parseCSVToRecords(rawData)
    
    for (const record of records) {
      // Generate unique identifiers for the user
      const uniqueEmail = generateUniqueEmail(record.telefono, record.nombrePropietario)
      const kindeId = `imported_${Math.random().toString(36).substring(2, 15)}`

      // Create user with required unique fields
      const user = await prisma.user.create({
        data: {
          kindeId,
          email: uniqueEmail,
          name: record.nombrePropietario,
          phone: record.telefono || null,
          address: record.domicilio || null,
          visits: 0,
          nextVisitFree: false,
        }
      })

      // Create pet
      const dateOfBirth = parseDateOfBirth(record.fechaNacimiento, record.edad)
      const weight = parseWeight(record.peso)
      const isNeutered = parseNeuteredStatus(record.esterilizado)

      await prisma.pet.create({
        data: {
          userId: user.id,
          internalId: record.internalId,
          name: record.nombreMascota,
          species: record.especie,
          breed: record.raza,
          dateOfBirth,
          gender: record.genero,
          weight,
          isNeutered,
          isDeceased: record.estado?.toLowerCase().includes('finado') || false,
          medicalHistory: {
            create: record.enfermedad || record.motivoConsulta ? {
              visitDate: new Date(),
              reasonForVisit: record.motivoConsulta || 'Consulta inicial',
              diagnosis: record.enfermedad || 'No especificado',
              treatment: 'Importado del sistema anterior',
              prescriptions: [],
              notes: `Estado: ${record.estado || 'No especificado'}`
            } : undefined
          }
        }
      })
    }

    console.log('Data import completed successfully')
  } catch (error) {
    console.error('Error importing data:', error)
    throw error
  }
}

// Helper function to parse CSV data
function parseCSVToRecords(rawData: string): RawPetRecord[] {
  // Split the data into lines and filter out headers
  const lines = rawData.split('\n')
    .filter(line => line.trim() && !line.toLowerCase().includes('nombre del propietario'))
  
  return lines.map(line => {
    const [
      nombrePropietario, telefono, domicilio, internalId,
      nombreMascota, especie, genero, raza, fechaNacimiento,
      edad, peso, esterilizado, enfermedad, motivoConsulta, estado
    ] = line.split(/\t|,/).map(field => field.trim())

    return {
      nombrePropietario, telefono, domicilio, internalId,
      nombreMascota, especie, genero, raza, fechaNacimiento,
      edad, peso, esterilizado, enfermedad, motivoConsulta, estado
    }
  })
}

// API Route handler
export async function POST(req: Request) {
  try {
    const data = await req.text()
    await importPetData(data)
    return new Response('Import successful', { status: 200 })
  } catch (error) {
    console.error('Import failed:', error)
    return new Response(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500 
    })
  }
}