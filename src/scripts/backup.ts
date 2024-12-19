import { Pool } from 'pg';
import { join } from 'path';
import { mkdir, writeFile, readdir, unlink } from 'fs/promises';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

// Tipos y enums del esquema
enum VaccineType {
  DP_PUPPY = 'DP_PUPPY',
  DHPPI = 'DHPPI',
  DHPPI_L = 'DHPPI_L',
  DHPPI_RL = 'DHPPI_RL',
  BORDETELLA = 'BORDETELLA',
  SEXTUPLE = 'SEXTUPLE',
  SEXTUPLE_R = 'SEXTUPLE_R',
  RABIES = 'RABIES'
}

enum VaccinationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  SCHEDULED = 'SCHEDULED'
}

enum VaccinationStage {
  PUPPY = 'PUPPY',
  ADULT = 'ADULT'
}

enum InventoryCategory {
  MEDICINE = 'MEDICINE',
  SURGICAL_MATERIAL = 'SURGICAL_MATERIAL',
  VACCINE = 'VACCINE',
  FOOD = 'FOOD',
  ACCESSORY = 'ACCESSORY',
  CONSUMABLE = 'CONSUMABLE'
}

enum InventoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  EXPIRED = 'EXPIRED'
}

enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  EXPIRED = 'EXPIRED'
}

type BackupResult = {
  success: boolean;
  path?: string;
  error?: string;
  timestamp: string;
  stats?: {
    totalTables: number;
    tables: Array<{
      name: string;
      rows: number;
      sizeInBytes: number;
    }>;
    totalSizeInBytes: number;
    compressionRatio?: number;
  };
};

type BackupConfig = {
  dbConfig: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  backupDir: string;
  maxBackups?: number;
  compress?: boolean;
  excludeTables?: string[];
};

const DEFAULT_CONFIG: BackupConfig = {
  dbConfig: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'your_database',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
  },
  backupDir: './backups',
  maxBackups: 5,
  compress: true,
  excludeTables: ['_prisma_migrations']
};

// Definición del esquema PostgreSQL basado en el modelo Prisma
const SCHEMA_DEFINITIONS = `
-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "VaccineType" AS ENUM (
  'DP_PUPPY', 'DHPPI', 'DHPPI_L', 'DHPPI_RL', 'BORDETELLA', 'SEXTUPLE', 'SEXTUPLE_R', 'RABIES'
);

CREATE TYPE "VaccinationStatus" AS ENUM (
  'PENDING', 'COMPLETED', 'OVERDUE', 'SCHEDULED'
);

CREATE TYPE "VaccinationStage" AS ENUM (
  'PUPPY', 'ADULT'
);

CREATE TYPE "InventoryCategory" AS ENUM (
  'MEDICINE', 'SURGICAL_MATERIAL', 'VACCINE', 'FOOD', 'ACCESSORY', 'CONSUMABLE'
);

CREATE TYPE "InventoryStatus" AS ENUM (
  'ACTIVE', 'INACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED'
);

CREATE TYPE "MovementType" AS ENUM (
  'IN', 'OUT', 'ADJUSTMENT', 'RETURN', 'EXPIRED'
);

-- Tablas
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "kindeId" TEXT UNIQUE NOT NULL,
  "email" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "name" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "preferredContactMethod" TEXT,
  "pet" TEXT,
  "visits" INTEGER NOT NULL DEFAULT 0,
  "nextVisitFree" BOOLEAN NOT NULL DEFAULT false,
  "lastVisit" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "roles" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "key" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "userRoles" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "roleId" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
  UNIQUE("userId", "roleId")
);

CREATE TABLE IF NOT EXISTS "visitHistory" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cost" DECIMAL(10,2) NOT NULL,
  "isFree" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "pets" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "internalId" TEXT,
  "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "species" TEXT NOT NULL,
  "breed" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMP WITH TIME ZONE NOT NULL,
  "gender" TEXT NOT NULL,
  "weight" DECIMAL(10,2) NOT NULL,
  "microchipNumber" TEXT,
  "isNeutered" BOOLEAN NOT NULL DEFAULT false,
  "isDeceased" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "medicalHistory" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "petId" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
  "visitDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "reasonForVisit" TEXT NOT NULL,
  "diagnosis" TEXT NOT NULL,
  "treatment" TEXT NOT NULL,
  "prescriptions" TEXT[] NOT NULL,
  "notes" TEXT
);

CREATE TABLE IF NOT EXISTS "vaccinations" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "petId" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
  "vaccineType" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "administrationDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "nextDoseDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "batchNumber" TEXT,
  "manufacturer" TEXT,
  "veterinarianName" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "vaccination_schedules" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "petId" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
  "vaccineType" "VaccineType" NOT NULL,
  "stage" "VaccinationStage" NOT NULL,
  "scheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "status" "VaccinationStatus" NOT NULL DEFAULT 'PENDING',
  "reminderSent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "appointments" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "petId" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
  "dateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "billings" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "petId" UUID REFERENCES "pets"("id") ON DELETE SET NULL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "services" TEXT[] NOT NULL,
  "cost" DECIMAL(10,2) NOT NULL,
  "paymentStatus" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "reminders" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "petId" UUID NOT NULL REFERENCES "pets"("id") ON DELETE CASCADE,
  "reminderType" TEXT NOT NULL,
  "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "status" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "staff" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "position" TEXT NOT NULL,
  "contactInformation" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "inventory_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "category" "InventoryCategory" NOT NULL,
  "description" TEXT,
  "activeCompound" TEXT,
  "presentation" TEXT,
  "measure" TEXT,
  "brand" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "minStock" INTEGER,
  "location" TEXT,
  "expirationDate" TIMESTAMP WITH TIME ZONE,
  "status" "InventoryStatus" NOT NULL DEFAULT 'ACTIVE',
  "batchNumber" TEXT,
  "specialNotes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "inventory_movements" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "itemId" UUID NOT NULL REFERENCES "inventory_items"("id") ON DELETE CASCADE,
  "type" "MovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reason" TEXT,
  "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "relatedRecordId" UUID,
  "notes" TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS "users_name_phone_idx" ON "users"("firstName", "lastName", "phone");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "vaccinations_pet_type_idx" ON "vaccinations"("petId", "vaccineType");
CREATE INDEX IF NOT EXISTS "vaccinations_next_dose_idx" ON "vaccinations"("nextDoseDate", "status");
CREATE INDEX IF NOT EXISTS "vaccination_schedules_pet_date_idx" ON "vaccination_schedules"("petId", "scheduledDate", "status");
CREATE INDEX IF NOT EXISTS "inventory_items_category_idx" ON "inventory_items"("category");
CREATE INDEX IF NOT EXISTS "inventory_items_name_idx" ON "inventory_items"("name");
CREATE INDEX IF NOT EXISTS "inventory_items_status_idx" ON "inventory_items"("status");
CREATE INDEX IF NOT EXISTS "inventory_items_expiration_idx" ON "inventory_items"("expirationDate");
CREATE INDEX IF NOT EXISTS "inventory_movements_item_date_idx" ON "inventory_movements"("itemId", "date");
CREATE INDEX IF NOT EXISTS "inventory_movements_user_idx" ON "inventory_movements"("userId");
`;

class PostgresBackupService {
  private config: BackupConfig;
  private pool: Pool;

  constructor(customConfig: Partial<BackupConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...customConfig,
      dbConfig: { ...DEFAULT_CONFIG.dbConfig, ...(customConfig.dbConfig || {}) }
    };
    this.pool = new Pool(this.config.dbConfig);
  }

  private async ensureSchema(): Promise<void> {
    try {
      console.log('🔍 Verificando y creando esquema si es necesario...');
      await this.pool.query(SCHEMA_DEFINITIONS);
      console.log('✅ Esquema verificado/creado correctamente');
    } catch (error) {
      console.error('❌ Error al crear el esquema:', error);
      throw error;
    }
  }

  private getBackupPath(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = this.config.compress ? 'sql.gz' : 'sql';
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

  private async getTables(): Promise<string[]> {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    const { rows } = await this.pool.query(query);
    return rows.map(row => row.table_name)
      .filter(table => !this.config.excludeTables?.includes(table));
  }

  private async getTableStats(): Promise<BackupResult['stats']> {
    const tables = await this.getTables();
    const stats: BackupResult['stats'] = {
      totalTables: tables.length,
      tables: [],
      totalSizeInBytes: 0
    };

    for (const table of tables) {
      const { rows: [rowCount] } = await this.pool.query(
        `SELECT COUNT(*) as count FROM "${table}"`
      );
      
      const { rows: [size] } = await this.pool.query(`
        SELECT pg_total_relation_size($1) as size
      `, [table]);

      const tableStats = {
        name: table,
        rows: parseInt(rowCount.count),
        sizeInBytes: parseInt(size.size)
      };

      stats.tables.push(tableStats);
      stats.totalSizeInBytes += tableStats.sizeInBytes;
    }

    return stats;
  }

  async createBackup(): Promise<BackupResult> {
    console.log('🚀 Iniciando proceso de backup PostgreSQL...');
    
    try {
      await mkdir(this.config.backupDir, { recursive: true });
      const backupPath = this.getBackupPath();
      
      // Verificar y crear esquema si es necesario
      await this.ensureSchema();
      
      const tables = await this.getTables();
      const stats = await this.getTableStats();
      
      console.log('📦 Generando backup de las tablas...');
      
      let backupContent = '';
      
      // Agregar metadatos y versión
      backupContent += `-- Backup generado el ${new Date().toISOString()}\n`;
      backupContent += `-- PostgreSQL Backup Service v2.0\n\n`;
      
      // Agregar schema
      backupContent += `-- Schema\n${SCHEMA_DEFINITIONS}\n\n`;
      
      // Desactivar restricciones temporalmente para la restauración
      backupContent += 'SET CONSTRAINTS ALL DEFERRED;\n\n';
      
      for (const table of tables) {
        console.log(`📄 Respaldando tabla: ${table}`);
        
        // Obtener datos
        const { rows: data } = await this.pool.query(`
          SELECT row_to_json(t) as data
          FROM "${table}" t
        `);
        
        if (data.length > 0) {
          backupContent += `-- Datos para la tabla ${table}\n`;
          
          // Limpiar tabla antes de insertar
          backupContent += `TRUNCATE TABLE "${table}" CASCADE;\n`;
          
          for (const row of data) {
            const columns = Object.keys(row.data);
            const values = Object.values(row.data).map(v => 
              v === null ? 'NULL' : 
              Array.isArray(v) ? `'{${v.map(item => `"${String(item)}"`).join(',')}}'` :
              typeof v === 'object' ? `'${JSON.stringify(v)}'` :
              typeof v === 'string' ? `'${String(v).replace(/'/g, "''")}'` :
              v
            ).join(', ');
            
            backupContent += `INSERT INTO "${table}"(${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values});\n`;
          }
          backupContent += '\n';
        }
      }
      
      // Restaurar restricciones
      backupContent += 'SET CONSTRAINTS ALL IMMEDIATE;\n';

      // Guardar el backup
      if (this.config.compress) {
        const gzip = createGzip();
        const output = createWriteStream(backupPath);
        await pipeline(
          Buffer.from(backupContent),
          gzip,
          output
        );
      } else {
        await writeFile(backupPath, backupContent);
      }

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
      await this.pool.end();
    }
  }
}

async function main(): Promise<void> {
  const backupService = new PostgresBackupService({
    maxBackups: 7,
    compress: true,
    excludeTables: ['_prisma_migrations', 'temp_logs']
  });

  const result = await backupService.createBackup();
  
  if (result.success) {
    console.log('✅ Backup completado correctamente');
    if (result.stats) {
      console.log('\nEstadísticas del backup:');
      console.log(`📊 Total de tablas: ${result.stats.totalTables}`);
      console.log(`📦 Tamaño total: ${(result.stats.totalSizeInBytes / 1024 / 1024).toFixed(2)} MB`);
      console.log('\nDetalles por tabla:');
      result.stats.tables.forEach(table => {
        console.log(`- ${table.name}: ${table.rows} filas (${(table.sizeInBytes / 1024).toFixed(2)} KB)`);
      });
    }
  } else {
    console.error('❌ Error en el proceso de backup');
    process.exit(1);
  }
}

// Ejecutar el backup si se llama directamente
if (require.main === module) {
  main();
}

export { PostgresBackupService, type BackupConfig, type BackupResult };