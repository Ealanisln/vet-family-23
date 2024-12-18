import { MongoClient } from 'mongodb';
import { join } from 'path';
import { mkdir, writeFile, readdir, unlink } from 'fs/promises';
import { Buffer } from 'buffer';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

// Tipos
type BackupResult = {
  success: boolean;
  path?: string;
  error?: string;
  timestamp: string;
  stats?: {
    totalDocuments: number;
    collections: Array<{
      name: string;
      documents: number;
      sizeInBytes: number;
    }>;
    totalSizeInBytes: number;
    compressionRatio?: number;
  };
};

type BackupConfig = {
  dbUri: string;
  backupDir: string;
  maxBackups?: number;
  compress?: boolean;
  excludeCollections?: string[];
};

// Configuración por defecto
const DEFAULT_CONFIG: BackupConfig = {
  dbUri: process.env.DATABASE_URL || 'mongodb://localhost:27017/your_database',
  backupDir: './backups',
  maxBackups: 5,
  compress: true,
  excludeCollections: ['sessions'] // Colecciones a excluir del backup
};

class BackupService {
  private config: BackupConfig;
  private client: MongoClient;

  constructor(customConfig: Partial<BackupConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.client = new MongoClient(this.config.dbUri);
  }

  private getBackupPath(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = this.config.compress ? 'json.gz' : 'json';
    return join(this.config.backupDir, `backup-${timestamp}.${extension}`);
  }

  private async cleanOldBackups(): Promise<void> {
    if (!this.config.maxBackups) return;

    try {
      const files = await readdir(this.config.backupDir);
      const backupFiles = files
        .filter(f => f.startsWith('backup-'))
        .sort((a, b) => b.localeCompare(a));

      for (const file of backupFiles.slice(this.config.maxBackups)) {
        await unlink(join(this.config.backupDir, file));
        console.log(`Backup antiguo eliminado: ${file}`);
      }
    } catch (error) {
      console.error('Error limpiando backups antiguos:', error);
    }
  }

  private async validateBackup(data: string): Promise<boolean> {
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  private async writeBackup(path: string, data: string): Promise<void> {
    const gzipAsync = promisify(gzip);
    
    if (this.config.compress) {
      const compressed = await gzipAsync(Buffer.from(data));
      await Bun.write(path, compressed);
    } else {
      await Bun.write(path, data);
    }
  }

  async createBackup(): Promise<BackupResult> {
    console.log('🚀 Iniciando proceso de backup...');
    
    try {
      await mkdir(this.config.backupDir, { recursive: true });
      const backupPath = this.getBackupPath();
      
      console.log('📡 Conectando a MongoDB...');
      await this.client.connect();
      
      const db = this.client.db();
      const collections = await db.listCollections().toArray();
      
      console.log('📦 Iniciando backup de las colecciones...');
      const backup: Record<string, any[]> = {};
      const stats = {
        totalDocuments: 0,
        collections: [] as Array<{name: string; documents: number; sizeInBytes: number}>,
        totalSizeInBytes: 0
      };

      for (const collection of collections) {
        const collectionName = collection.name;
        
        if (this.config.excludeCollections?.includes(collectionName)) {
          console.log(`⏭️  Saltando colección excluida: ${collectionName}`);
          continue;
        }

        console.log(`📄 Respaldando colección: ${collectionName}`);
        
        const documents = await db.collection(collectionName).find({}).toArray();
        backup[collectionName] = documents;

        const collectionStats = {
          name: collectionName,
          documents: documents.length,
          sizeInBytes: Buffer.byteLength(JSON.stringify(documents))
        };
        
        stats.collections.push(collectionStats);
        stats.totalDocuments += documents.length;
        stats.totalSizeInBytes += collectionStats.sizeInBytes;
      }

      const backupJson = JSON.stringify(backup, null, 2);
      const isValid = await this.validateBackup(backupJson);
      
      if (!isValid) {
        throw new Error('El backup generado no es un JSON válido');
      }

      await this.writeBackup(backupPath, backupJson);
      await this.cleanOldBackups();

      console.log('✅ Backup completado exitosamente');
      console.log('📍 Ubicación:', backupPath);
      
      return {
        success: true,
        path: backupPath,
        timestamp: new Date().toISOString(),
        stats
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error durante el backup:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    } finally {
      await this.client.close();
    }
  }
}

async function main(): Promise<void> {
  const backupService = new BackupService({
    maxBackups: 7,
    compress: true,
    excludeCollections: ['sessions', 'caches']
  });

  const result = await backupService.createBackup();
  
  if (result.success) {
    console.log('✅ Backup completado correctamente');
    if (result.stats) {
      console.log('\nEstadísticas del backup:');
      console.log(`📊 Total de documentos: ${result.stats.totalDocuments}`);
      console.log(`📦 Tamaño total: ${(result.stats.totalSizeInBytes / 1024 / 1024).toFixed(2)} MB`);
      console.log('\nDetalles por colección:');
      result.stats.collections.forEach(col => {
        console.log(`- ${col.name}: ${col.documents} documentos (${(col.sizeInBytes / 1024).toFixed(2)} KB)`);
      });
    }
  } else {
    console.error('❌ Error en el proceso de backup');
    process.exit(1);
  }
}

// Ejecutar el backup si se llama directamente
if (import.meta.main) {
  main();
}

export { BackupService, type BackupConfig, type BackupResult };