import { readFile } from 'fs/promises';
import { join } from 'path';

const BACKUP_PATH = '/Users/ealanis/Development/working-projects/vet-family-23/backups/backup-2024-11-16T01-32-43-393Z.json';

async function verifyBackup(filePath: string) {
  try {
    console.log('Leyendo backup...\n');
    const backupData = await readFile(filePath, 'utf-8');
    const collections = JSON.parse(backupData);
    
    console.log('📊 Resumen del Backup:');
    console.log('==================');
    
    // Mostrar información de cada colección
    for (const [collectionName, documents] of Object.entries(collections)) {
      const docs = documents as any[];
      console.log(`\nColección: ${collectionName}`);
      console.log(`Documentos: ${docs.length}`);
      
      if (docs.length > 0) {
        // Mostrar campos disponibles en el primer documento
        const firstDoc = docs[0];
        console.log('Campos disponibles:', Object.keys(firstDoc));
        
        // Mostrar algunos campos clave si existen
        if (firstDoc._id) console.log('ID de ejemplo:', firstDoc._id);
        if (firstDoc.createdAt) console.log('Fecha de creación:', new Date(firstDoc.createdAt).toLocaleDateString());
        
        console.log('\nEjemplo de documento:');
        console.log(JSON.stringify(firstDoc, null, 2).slice(0, 200) + '...');
      }
    }
    
    // Calcular tamaño total
    const sizeInMB = (backupData.length / (1024 * 1024)).toFixed(2);
    console.log(`\n📦 Tamaño total del backup: ${sizeInMB} MB`);
    
  } catch (error) {
    console.error('❌ Error al verificar el backup:', error);
    console.error('Ruta del archivo:', filePath);
  }
}

// Usar la ruta completa
verifyBackup(BACKUP_PATH)
  .then(() => console.log('\n✅ Verificación completada'))
  .catch((error) => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });