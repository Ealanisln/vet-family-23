#!/bin/bash

# Variables de configuración
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/Users/ealanis/Development/working-projects/vet-family-23/backups/mongodb"
DB_NAME="veterinaria_lealtad"
MONGO_URI="mongodb+srv://alanisadmin:iCGfLfmKeg0mbUP7@cluster0.l0h18b7.mongodb.net/veterinaria_lealtad"
TEMP_DIR="${BACKUP_DIR}/temp_${TIMESTAMP}"

# Función para limpiar en caso de error
cleanup() {
    echo "🧹 Limpiando archivos temporales..."
    rm -rf "$TEMP_DIR"
}

# Configurar trap para limpiar en caso de error
trap cleanup ERR EXIT

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p "$BACKUP_DIR"
mkdir -p "$TEMP_DIR"

# Verificar que mongodump está instalado
if ! command -v mongodump &> /dev/null; then
    echo "❌ Error: mongodump no está instalado"
    exit 1
fi

# Realizar el backup
echo "🚀 Iniciando backup de $DB_NAME - $TIMESTAMP"
if ! mongodump --uri="$MONGO_URI" --out="$TEMP_DIR"; then
    echo "❌ Error al realizar el backup"
    exit 1
fi

# Verificar que el backup se creó correctamente
if [ ! -d "$TEMP_DIR/$DB_NAME" ]; then
    echo "❌ Error: El backup no se creó correctamente"
    exit 1
fi

# Comprimir el backup
echo "📦 Comprimiendo backup..."
cd "$TEMP_DIR"
if ! tar -czf "$BACKUP_DIR/$TIMESTAMP.tar.gz" "./"; then
    echo "❌ Error al comprimir el backup"
    exit 1
fi

# Verificar el tamaño del archivo comprimido
BACKUP_SIZE=$(stat -f %z "$BACKUP_DIR/$TIMESTAMP.tar.gz")
if [ $BACKUP_SIZE -lt 1000 ]; then  # menos de 1KB
    echo "⚠️  Advertencia: El archivo de backup es muy pequeño ($BACKUP_SIZE bytes)"
    echo "❌ Es probable que el backup esté vacío o incorrecto"
    rm -f "$BACKUP_DIR/$TIMESTAMP.tar.gz"
    exit 1
fi

# Mantener solo los últimos 5 backups
echo "🔄 Manteniendo los últimos 5 backups..."
ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null

# Mostrar resultado
echo "✅ Backup completado exitosamente"
echo "📂 Ubicación: $BACKUP_DIR/$TIMESTAMP.tar.gz"
echo "📊 Tamaño: $(ls -lh "$BACKUP_DIR/$TIMESTAMP.tar.gz" | awk '{print $5}')"

# Listar backups disponibles
echo -e "\n📋 Backups disponibles:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No hay backups disponibles"

# Verificar el contenido del backup
echo -e "\n📑 Contenido del backup:"
tar -tvf "$BACKUP_DIR/$TIMESTAMP.tar.gz"