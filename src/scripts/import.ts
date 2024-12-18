import { MongoClient, ObjectId } from 'mongodb'
import fs from 'fs/promises'
import path from 'path'
import { config } from 'dotenv'
import { MongoServerError } from 'mongodb'

// Load environment variables
config()

// MongoDB connection URL from your DATABASE_URL environment variable
const url = process.env.DATABASE_URL!
const dbName = url.split('/').pop()?.split('?')[0]

type BackupData = {
  users?: Array<{
    _id?: string
    address?: string
    createdAt: string | Date
    email: string
    firstName?: string
    internalId?: string
    kindeId: string
    lastName?: string
    name?: string
    nextVisitFree: boolean
    phone?: string
    roles: string[]
    updatedAt: string | Date
    visits: bigint
  }>
  pet?: Array<{
    _id?: string
    breed: string
    dateOfBirth: string | Date
    gender: string
    internalId?: string
    isDeceased?: boolean
    isNeutered: boolean
    microchipNumber?: string
    name: string
    species: string
    userId: string
    weight: number
  }>
  medicalHistory?: Array<{
    _id?: string
    diagnosis: string
    notes?: string
    petId: string
    prescriptions: string[]
    reasonForVisit: string
    treatment: string
    visitDate: string | Date
  }>
  medicines?: Array<{
    _id?: string
    category?: string
    commercialName?: string
    expirationDate?: string | Date
    status?: string
  }>
  inventory_items?: Array<{
    _id?: string
    activeCompound?: string
    batchNumber?: string
    brand?: string
    category: string
    createdAt: string | Date
    description?: string
    expirationDate?: string | Date
    location?: string
    measure?: string
    minStock?: bigint
    name: string
    presentation?: string
    quantity: bigint
    specialNotes?: string
    status: string
    updatedAt: string | Date
  }>
  vaccinations?: Array<{
    _id?: string
    administrationDate: string | Date
    batchNumber?: string
    createdAt: string | Date
    manufacturer?: string
    nextDoseDate: string | Date
    notes?: string
    petId: string
    stage: string
    status: string
    updatedAt: string | Date
    vaccineType: string
    veterinarianName: string
  }>
  roles?: Array<{
    _id?: string
    key: string
    name: string
  }>
  userRoles?: Array<{
    _id?: string
    roleId: string
    userId: string
  }>
}

// Helper function to check if a string is a valid ObjectId
function isValidObjectId(value: string): boolean {
  return ObjectId.isValid(value) && String(new ObjectId(value)) === value
}

// Helper function to transform types for MongoDB
function transformDocument(doc: Record<string, any>): Record<string, any> {
  const transformed: Record<string, any> = {}

  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id') {
      // Only create ObjectId if the value is a valid ObjectId string
      transformed._id = typeof value === 'string' && isValidObjectId(value)
        ? new ObjectId(value)
        : value
    } else if (typeof value === 'string') {
      if (key.endsWith('At') || key.endsWith('Date')) {
        transformed[key] = new Date(value)
      } else if (key === 'quantity' || key === 'minStock' || key === 'visits') {
        // Convert BigInt strings to Numbers for MongoDB
        transformed[key] = Number(value)
      } else if (key.endsWith('Id') && isValidObjectId(value)) {
        // Convert string IDs to ObjectIds only if they're valid
        transformed[key] = new ObjectId(value)
      } else {
        transformed[key] = value
      }
    } else if (Array.isArray(value)) {
      transformed[key] = value.map(item => 
        typeof item === 'string' && isValidObjectId(item) ? new ObjectId(item) : item
      )
    } else {
      transformed[key] = value
    }
  }

  return transformed
}

async function importCollection(
  db: any,
  collectionName: string,
  data: any[],
  batchSize = 50
) {
  let imported = 0
  let skipped = 0
  let errors = 0

  const collection = db.collection(collectionName)
  
  // Process in batches
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    
    // Process each document in the batch
    for (const doc of batch) {
      try {
        const transformedDoc = transformDocument(doc)
        
        // Try to insert the document
        await collection.updateOne(
          { _id: transformedDoc._id },
          { $set: transformedDoc },
          { upsert: true }
        )
        
        imported++
        process.stdout.write(`\rImporting ${collectionName}: ${imported}/${data.length} (${skipped} skipped, ${errors} errors)`)
      } catch (error) {
        // Type guard to check if error is MongoServerError
        if (error instanceof MongoServerError && error.code === 11000) {
          skipped++
        } else {
          errors++
          console.error(`\nError importing ${collectionName} document:`, error)
        }
      }
    }
    
    // Add a small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n✅ ${collectionName}: imported ${imported} records (${skipped} duplicates skipped, ${errors} errors)`)
  return { imported, skipped, errors }
}

async function importData() {
  const client = new MongoClient(url)

  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(dbName)
    
    const backupPath = path.join(process.cwd(), 'backups', 'backup-2024-11-16T01-32-43-393Z.json')
    const data = await fs.readFile(backupPath, 'utf8')
    const backup = JSON.parse(data) as BackupData

    console.log('Starting database import...\n')

    const results = []

    // Import collections in order
    const collectionsToImport = [
      { name: 'users', data: backup.users },
      { name: 'roles', data: backup.roles },
      { name: 'userRoles', data: backup.userRoles },
      { name: 'pet', data: backup.pet },
      { name: 'medicalHistory', data: backup.medicalHistory },
      { name: 'medicines', data: backup.medicines },
      { name: 'inventory_items', data: backup.inventory_items },
      { name: 'vaccinations', data: backup.vaccinations }
    ]

    for (const { name, data } of collectionsToImport) {
      if (data?.length) {
        const result = await importCollection(db, name, data)
        results.push(result)
      }
    }

    // Calculate total statistics
    const totals = results.reduce((acc, curr) => ({
      imported: acc.imported + curr.imported,
      skipped: acc.skipped + curr.skipped,
      errors: acc.errors + curr.errors
    }), { imported: 0, skipped: 0, errors: 0 })

    console.log('\n✅ Database import completed!')
    console.log(`📊 Total Statistics:`)
    console.log(`   Imported: ${totals.imported} records`)
    console.log(`   Skipped: ${totals.skipped} duplicates`)
    console.log(`   Errors: ${totals.errors} records`)

  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  } finally {
    await client.close()
  }
}

// Run the import
importData()
  .catch((error) => {
    console.error('❌ Fatal error during import:', error)
    process.exit(1)
  })