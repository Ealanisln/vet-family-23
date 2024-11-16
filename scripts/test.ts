import { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function testCollection(name: string, counter: () => Promise<number>) {
  try {
    const count = await counter()
    console.log(`✅ ${name}: ${count} records`)
    return true
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`❌ ${name}: ${error.message}`)
    } else {
      console.error(`❌ ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    return false
  }
}

async function testConnection() {
  try {
    // Try to connect
    await prisma.$connect()
    console.log('✅ Successfully connected to database')
    console.log('\nTesting collections access:')
    console.log('-------------------------')
    
    // Test each collection individually
    await testCollection('Users', () => prisma.users.count())
    await testCollection('Pets', () => prisma.pet.count())
    await testCollection('Medicines', () => prisma.medicines.count())
    await testCollection('Inventory Items', () => prisma.inventory_items.count())
    await testCollection('Vaccinations', () => prisma.vaccinations.count())
    await testCollection('Medical History', () => prisma.medicalHistory.count())
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Failed to connect to database:', error.message)
    } else {
      console.error('❌ Failed to connect to database:', 'Unknown error')
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
  .catch((error: unknown) => {
    console.error('❌ Unhandled error:', 
      error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  })