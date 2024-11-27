#!/bin/bash

# Variables de configuración
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/Users/ealanis/Development/working-projects/vet-family-23/backups/mongodb"
DB_NAME="veterinaria"
ATLAS_URI="mongodb+srv://alanisadmin:iCGfLfmKeg0mbUP7@cluster0.l0h18b7.mongodb.net/veterinaria_lealtad"
DOCKER_CONTAINER="mongodb_veterinaria_dev"
LOCAL_DB_USER="root"
LOCAL_DB_PASSWORD="example"
LOCAL_DB_URI="mongodb://$LOCAL_DB_USER:$LOCAL_DB_PASSWORD@localhost:27017/veterinaria?authSource=admin&replicaSet=rs0"
TEMP_DIR="${BACKUP_DIR}/temp_${TIMESTAMP}"
LOG_FILE="${BACKUP_DIR}/backup_restore_${TIMESTAMP}.log"

# Configuración de colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${2:-$NC}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

# Función para limpiar en caso de error
cleanup() {
    log "🧹 Limpiando archivos temporales..." "$YELLOW"
    rm -rf "$TEMP_DIR"
    if [ -n "$1" ] && [ "$1" != "0" ]; then
        log "❌ Script terminado con errores. Revisa el log: $LOG_FILE" "$RED"
    fi
}

# Configurar trap para limpiar en caso de error
trap 'cleanup $?' ERR EXIT

# Función para inicializar el replica set
init_replica_set() {
    log "🔄 Inicializando replica set..." "$YELLOW"
    if ! docker exec "$DOCKER_CONTAINER" mongosh \
        -u "$LOCAL_DB_USER" \
        -p "$LOCAL_DB_PASSWORD" \
        --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})' --quiet; then
        log "❌ Error al inicializar el replica set" "$RED"
        return 1
    fi
    
    # Esperar a que el replica set esté listo
    sleep 5
    log "✅ Replica set inicializado" "$GREEN"
    return 0
}

# Función para verificar el replica set
check_replica_set() {
    log "🔍 Verificando estado del replica set..." "$YELLOW"
    
    # Intentar verificar el estado
    if ! docker exec "$DOCKER_CONTAINER" mongosh \
        -u "$LOCAL_DB_USER" \
        -p "$LOCAL_DB_PASSWORD" \
        --quiet \
        --eval "rs.status().ok" | grep -q "1"; then
        
        log "⚠️ Replica set no está configurado, intentando inicializar..." "$YELLOW"
        if ! init_replica_set; then
            log "❌ No se pudo configurar el replica set" "$RED"
            return 1
        fi
    fi
    
    log "✅ Replica set funcionando correctamente" "$GREEN"
    return 0
}

# Función para hacer backup de Atlas
backup_atlas() {
    log "🚀 Iniciando backup de MongoDB Atlas..." "$YELLOW"
    
    # Crear directorios necesarios
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$TEMP_DIR"
    
    # Verificar que mongodump está instalado
    if ! command -v mongodump &> /dev/null; then
        log "❌ Error: mongodump no está instalado" "$RED"
        exit 1
    fi
    
    log "📥 Ejecutando mongodump..." "$YELLOW"
    if ! mongodump --uri="$ATLAS_URI" --out="$TEMP_DIR"; then
        log "❌ Error al hacer backup" "$RED"
        exit 1
    fi
    
    log "📦 Comprimiendo backup..." "$YELLOW"
    cd "$TEMP_DIR"
    if ! tar -czf "$BACKUP_DIR/$TIMESTAMP.tar.gz" ./*; then
        log "❌ Error al comprimir el backup" "$RED"
        exit 1
    fi
    
    # Verificar el tamaño del archivo comprimido
    BACKUP_SIZE=$(stat -f %z "$BACKUP_DIR/$TIMESTAMP.tar.gz")
    if [ $BACKUP_SIZE -lt 1000 ]; then
        log "⚠️  Advertencia: El archivo de backup es muy pequeño ($BACKUP_SIZE bytes)" "$RED"
        log "❌ Es probable que el backup esté vacío o incorrecto" "$RED"
        rm -f "$BACKUP_DIR/$TIMESTAMP.tar.gz"
        exit 1
    fi
    
    # Mantener solo los últimos 5 backups
    log "🔄 Manteniendo los últimos 5 backups..." "$YELLOW"
    ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
    
    log "✅ Backup completado exitosamente" "$GREEN"
    log "📂 Ubicación: $BACKUP_DIR/$TIMESTAMP.tar.gz" "$GREEN"
    log "📊 Tamaño: $(ls -lh "$BACKUP_DIR/$TIMESTAMP.tar.gz" | awk '{print $5}')" "$GREEN"
    
    # Listar backups disponibles
    log "\n📋 Backups disponibles:" "$GREEN"
    ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || log "No hay backups disponibles" "$YELLOW"
    
    # Verificar el contenido del backup
    log "\n📑 Contenido del backup:" "$GREEN"
    tar -tvf "$BACKUP_DIR/$TIMESTAMP.tar.gz"
}

# Función para restaurar a Docker
restore_to_docker() {
    log "🚀 Iniciando proceso de restauración a Docker..." "$YELLOW"
    
    # Verificar que el contenedor existe y está corriendo
    if ! docker ps | grep -q "$DOCKER_CONTAINER"; then
        log "❌ Error: El contenedor $DOCKER_CONTAINER no está corriendo" "$RED"
        exit 1
    fi
    
    # Verificar el replica set
    if ! check_replica_set; then
        log "❌ Por favor, configura el replica set antes de continuar" "$RED"
        exit 1
    fi
    
    log "📋 Backups disponibles:" "$GREEN"
    ls -lh "$BACKUP_DIR"/*.tar.gz || { log "❌ No hay backups disponibles" "$RED"; exit 1; }
    
    echo -e "${YELLOW}🤔 Ingrese el nombre del archivo a restaurar (ejemplo: 20240323_120000.tar.gz):${NC}"
    read BACKUP_FILE
    
    if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        log "❌ Error: El archivo no existe" "$RED"
        exit 1
    fi
    
    # Crear directorio temporal para la restauración
    TEMP_DIR="$BACKUP_DIR/restore_temp_$TIMESTAMP"
    mkdir -p "$TEMP_DIR"
    
    log "📂 Descomprimiendo backup en directorio temporal..." "$YELLOW"
    cd "$TEMP_DIR"
    if ! tar -xzf "$BACKUP_DIR/$BACKUP_FILE"; then
        log "❌ Error al descomprimir el backup" "$RED"
        exit 1
    fi
    
    log "📂 Contenido del directorio temporal:" "$GREEN"
    ls -la "$TEMP_DIR"
    
    # Creamos un directorio con el nombre de la base de datos de destino
    mkdir -p "$TEMP_DIR/veterinaria"
    
    # Movemos todos los archivos .bson y .metadata.json al directorio de la base de datos
    if ! mv "$TEMP_DIR/veterinaria_lealtad"/* "$TEMP_DIR/veterinaria/"; then
        log "❌ Error al mover archivos" "$RED"
        exit 1
    fi
    
    log "🔄 Copiando archivos al contenedor Docker..." "$YELLOW"
    if ! docker cp "$TEMP_DIR/veterinaria/." "$DOCKER_CONTAINER":/tmp/backup; then
        log "❌ Error al copiar archivos al contenedor" "$RED"
        exit 1
    fi
    
    log "📥 Restaurando base de datos en Docker..." "$YELLOW"
    if ! docker exec "$DOCKER_CONTAINER" mongorestore \
        --uri="mongodb://$LOCAL_DB_USER:$LOCAL_DB_PASSWORD@localhost:27017/?authSource=admin&replicaSet=rs0" \
        --db="veterinaria" \
        --drop \
        --preserveUUID \
        --maintainInsertionOrder \
        "/tmp/backup"; then
        log "❌ Error durante la restauración" "$RED"
        check_replica_set
        exit 1
    fi
    
    log "🔄 Verificando y corrigiendo nombres de colecciones..." "$YELLOW"
    docker exec "$DOCKER_CONTAINER" mongosh \
        -u "$LOCAL_DB_USER" \
        -p "$LOCAL_DB_PASSWORD" \
        --quiet \
        --eval '
        let db = db.getSiblingDB("veterinaria");
        
        // Mapeo de nombres antiguos a nuevos
        let collectionMapping = {
            "inventory_items": "medicines",
            "inventory_movements": "stock_movements",
            "VisitHistory": "MedicalHistory",
            "users": "Staff",
            "userRoles": "roles"
        };
        
        // Renombrar colecciones según sea necesario
        for (let oldName in collectionMapping) {
            let newName = collectionMapping[oldName];
            if (db.getCollection(oldName).count() > 0 && db.getCollection(newName).count() === 0) {
                try {
                    db.getCollection(oldName).renameCollection(newName, true);
                    print(`Renombrada colección ${oldName} a ${newName}`);
                } catch(e) {
                    print(`Error al renombrar ${oldName}: ${e.message}`);
                }
            }
        }
        '
    
    log "🧹 Limpiando archivos temporales en el contenedor..." "$YELLOW"
    docker exec "$DOCKER_CONTAINER" rm -rf "/tmp/backup"
    
    log "✅ Restauración completada exitosamente!" "$GREEN"
    
    # Verificar las colecciones restauradas con conteo
    log "📊 Verificando colecciones restauradas:" "$GREEN"
    docker exec "$DOCKER_CONTAINER" mongosh \
        -u "$LOCAL_DB_USER" \
        -p "$LOCAL_DB_PASSWORD" \
        --quiet \
        --eval '
        let db = db.getSiblingDB("veterinaria");
        db.getCollectionNames().sort().forEach(function(c) {
            let count = db.getCollection(c).countDocuments();
            print(`${c}: ${count} documentos`);
        });
        '
}

# Función para mostrar el menú
show_menu() {
    echo -e "\n${YELLOW}🔧 MongoDB Backup & Restore Tool${NC}"
    echo -e "${GREEN}1. Hacer backup de MongoDB Atlas${NC}"
    echo -e "${GREEN}2. Restaurar backup a Docker local${NC}"
    echo -e "${GREEN}3. Verificar estado del replica set${NC}"
    echo -e "${RED}4. Salir${NC}"
    echo -e "${YELLOW}Seleccione una opción (1-4):${NC}"
}

# Menú principal
while true; do
    show_menu
    read option
    
    case $option in
        1)
            backup_atlas
            ;;
        2)
            restore_to_docker
            ;;
        3)
            check_replica_set
            ;;
        4)
            log "👋 Adiós!" "$GREEN"
            exit 0
            ;;
        *)
            log "❌ Opción inválida" "$RED"
            ;;
    esac
    
    echo -e "\n${YELLOW}Presione ENTER para continuar...${NC}"
    read
done