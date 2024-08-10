import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';

dotenv.config();


if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function migrate() {
  try {
    await client.connect();
    const db: Db = client.db(process.env.MONGODB_DB_NAME);

    // Migrate Cliente collection
    await migrateClientes(db);

    // Add new collections
    await createNewCollections(db);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

async function migrateClientes(db: Db) {
  const clientesCollection = db.collection('clientes');

  // 1. First, update documents with empty email fields
  await clientesCollection.updateMany(
    { email: { $in: [null, ""] } },
    {
      $set: {
        email: "pendiente@ejemplo.com",
        apellido: 'Pendiente',
        telefono: 'Pendiente',
        direccion: 'Pendiente',
        metodoContactoPreferido: 'telefono',
        historialVisitas: []
      }
    }
  );

  // 2. Add new fields to all documents
  await clientesCollection.updateMany(
    {},
    {
      $set: {
        apellido: { $ifNull: ["$apellido", "Pendiente"] },
        telefono: { $ifNull: ["$telefono", "Pendiente"] },
        direccion: { $ifNull: ["$direccion", "Pendiente"] },
        metodoContactoPreferido: { $ifNull: ["$metodoContactoPreferido", "telefono"] },
        historialVisitas: { $ifNull: ["$historialVisitas", []] }
      }
    }
  );

  // 3. Create a unique index on email, if it doesn't exist
  const indexes = await clientesCollection.indexes();
  const emailIndexExists = indexes.some(index => index.key && index.key.email === 1 && index.unique);
  
  if (!emailIndexExists) {
    try {
      await clientesCollection.createIndex({ email: 1 }, { unique: true });
      console.log('Unique index on email created successfully');
    } catch (error) {
      console.error('Failed to create unique index on email:', error);
    }
  } else {
    console.log('Unique index on email already exists');
  }

  console.log('Clientes migration completed');
}
async function createNewCollections(db: Db) {
  // ... (rest of the function remains the same)
}

migrate().catch(console.error);