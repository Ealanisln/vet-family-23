import { MongoClient } from 'mongodb';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

// Tipos
type BackupResult = {
  success: boolean;
  path?: string;
  error?: string;
  timestamp: string;
};

// Configuración
const config = {
  dbUri: process.env.DATABASE_URL || 'mongodb://localhost:27017/your_database',
  backupDir: './backups',
  getBackupPath: () => join(
    config.backupDir,
    `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  )
};

async function createBackup(): Promise<BackupResult> {
  const client = new MongoClient(config.dbUri);

  try {
    await mkdir(config.backupDir, { recursive: true });
    const backupPath = config.getBackupPath();
    
    console.log('Conectando a MongoDB...');
    await client.connect();
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log('Iniciando backup de las colecciones...');
    const backup: Record<string, any[]> = {};

    // Hacer backup de cada colección
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Respaldando colección: ${collectionName}`);
      
      const documents = await db.collection(collectionName).find({}).toArray();
      backup[collectionName] = documents;
    }

    // Guardar el backup como JSON
    await writeFile(
      backupPath,
      JSON.stringify(backup, null, 2),
      'utf-8'
    );

    console.log('Backup completado exitosamente');
    console.log('Ubicación:', backupPath);
    
    return {
      success: true,
      path: backupPath,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error durante el backup:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  } finally {
    await client.close();
  }
}

async function main(): Promise<void> {
  console.log('Iniciando proceso de backup...');
  const result = await createBackup();
  
  if (result.success) {
    console.log('✅ Backup completado correctamente');
  } else {
    console.error('❌ Error en el proceso de backup');
    process.exit(1);
  }
}

main();