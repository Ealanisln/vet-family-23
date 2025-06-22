# Funcionalidad de Archivado de Mascotas

## Descripción
Se ha implementado una nueva funcionalidad que permite archivar mascotas en el sistema, proporcionando una alternativa no destructiva al eliminar registros. Las mascotas archivadas se ocultan de la vista principal pero mantienen todos sus datos y registros médicos intactos.

## Características Implementadas

### 1. Campo de Base de Datos
- ✅ Nuevo campo `isArchived` (boolean, default: false) en la tabla `Pet`
- ✅ Índice agregado para optimizar consultas por estado archivado
- ✅ Migración de base de datos aplicada

### 2. Funcionalidad Backend
- ✅ Nueva acción `archivePet()` en `/src/app/actions/archive-pet.ts`
- ✅ Validación de permisos (solo el propietario puede archivar su mascota)
- ✅ Actualización de todas las consultas de mascotas para incluir `isArchived`

### 3. Interfaz de Usuario
- ✅ Menú de acciones actualizado con opciones "Archivar" y "Desarchivar"
- ✅ Iconos diferenciados (Archive/ArchiveRestore de Lucide)
- ✅ Diálogo de confirmación para archivado/desarchivado
- ✅ Checkbox para mostrar/ocultar mascotas archivadas en la tabla
- ✅ Indicadores visuales (badges) para mascotas archivadas
- ✅ Filtrado automático (mascotas archivadas ocultas por defecto)

### 4. Tipos TypeScript
- ✅ Interfaces actualizadas (`Pet`, `TablePet`, `PetForMedicalRecord`)
- ✅ Tipos de respuesta para la acción de archivado

## Uso de la Funcionalidad

### Para Archivar una Mascota
1. Ir a la tabla de mascotas (`/admin/mascotas`)
2. Hacer clic en el menú de acciones (⋯) de la mascota deseada
3. Seleccionar "Archivar mascota"
4. Confirmar en el diálogo que aparece

### Para Desarchivar una Mascota
1. En la tabla de mascotas, activar el checkbox "Mostrar mascotas archivadas"
2. Localizar la mascota archivada (tendrá un badge "Archivada")
3. Hacer clic en el menú de acciones (⋯)
4. Seleccionar "Desarchivar mascota"
5. Confirmar en el diálogo que aparece

### Comportamiento del Sistema
- **Por defecto**: Las mascotas archivadas NO se muestran en ninguna lista
- **Historial médico**: No se pueden agregar registros médicos a mascotas archivadas
- **POS/Ventas**: Las mascotas archivadas no aparecen en los selectors
- **Búsquedas**: Las mascotas archivadas se excluyen automáticamente

## Archivos Modificados

### Backend
- `prisma/schema.prisma` - Agregado campo `isArchived`
- `src/app/actions/archive-pet.ts` - Nueva acción
- `src/app/actions/get-pets.ts` - Actualizado para incluir `isArchived`
- `src/app/actions/add-medical-record.ts` - Filtrar mascotas archivadas
- `src/app/api/clients/[id]/pets/route.ts` - Filtrar mascotas archivadas

### Frontend
- `src/components/Clientes/PetActions.tsx` - Acciones de archivado
- `src/components/Clientes/PetTable.tsx` - Filtros y visualización
- `src/types/pet.ts` - Interfaces actualizadas

### Base de Datos
- `prisma/migrations/[timestamp]_add_is_archived_to_pets/` - Nueva migración

## Consideraciones Técnicas

### Rendimiento
- Se agregó un índice en `isArchived` para optimizar consultas
- Las consultas por defecto filtran mascotas archivadas (WHERE isArchived = false)

### Seguridad
- Solo los propietarios pueden archivar sus propias mascotas
- Validación de permisos en el backend

### Experiencia de Usuario
- Proceso de archivado reversible y no destructivo
- Indicadores visuales claros para mascotas archivadas
- Opciones de filtrado intuitivas

## Próximos Pasos Sugeridos
1. Agregar filtro de mascotas archivadas en otros componentes si es necesario
2. Considerar agregar fechas de archivado/desarchivado para auditoría
3. Evaluar si se necesitan notificaciones por email cuando se archiva una mascota
4. Implementar búsqueda específica de mascotas archivadas si es requerido 