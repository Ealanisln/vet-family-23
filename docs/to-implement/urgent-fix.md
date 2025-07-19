# Plan de Revisión CRUD y QA - Vet Family App

## 🎯 Objetivo Principal
Identificar y resolver problemas de registros duplicados y errores de eliminación, estableciendo una base sólida de testing para las operaciones CRUD.

## 📋 Fase 1: Revisión de Operaciones CRUD

### 1.1 CREATE - Creación de Registros

#### **Usuarios (User)**
- [ ] Revisar lógica de creación en `/src/app/api/user/register/route.ts`
- [ ] Verificar validación de duplicados por email/phone (línea 272)
- [ ] Revisar integración con Kinde Auth
- [ ] Validar transacciones en casos de error
- [ ] **Problema detectado**: Posible condición de carrera en creación de usuarios

#### **Mascotas (Pet)**
- [ ] Revisar `/src/app/actions/add-edit-pet.ts`
- [ ] Verificar generación de `internalId` único
- [ ] Validar asociación correcta con usuario
- [ ] Revisar manejo de campos opcionales
- [ ] Verificar transacciones atómicas

#### **Clientes (Client/User)**
- [ ] Revisar `/src/app/actions/get-client-data.ts`
- [ ] Verificar unicidad por `kindeId`
- [ ] Validar campos requeridos vs opcionales
- [ ] Revisar lógica de búsqueda duplicada

### 1.2 READ - Lectura de Registros

#### **Búsqueda de Clientes**
- [ ] Revisar `/src/app/api/clients/search/*`
- [ ] Verificar índices en schema.prisma (líneas 43-44)
- [ ] Validar paginación si existe
- [ ] Revisar filtros y ordenamiento

#### **Listado de Mascotas**
- [ ] Revisar `/src/app/actions/get-pets.ts`
- [ ] Verificar relaciones con usuario
- [ ] Validar permisos de acceso
- [ ] Revisar carga de datos relacionados

### 1.3 UPDATE - Actualización de Registros

#### **Actualización de Mascotas**
- [ ] Revisar lógica de edición en `/src/app/actions/add-edit-pet.ts`
- [ ] Verificar validación de propiedad (usuario correcto)
- [ ] Validar actualizaciones parciales
- [ ] Revisar manejo de concurrencia

#### **Actualización de Usuarios**
- [ ] Revisar actualizaciones en `/src/app/actions/get-client-data.ts`
- [ ] Verificar sincronización con Kinde
- [ ] Validar campos actualizables
- [ ] Revisar triggers de `updatedAt`

### 1.4 DELETE - Eliminación de Registros

#### **Eliminación de Mascotas** ⚠️ **CRÍTICO**
- [ ] Revisar `/src/app/actions/delete-pets.ts`
- [ ] Verificar transacción completa (línea 28)
- [ ] Validar eliminación en cascada de:
  - [ ] MedicalHistory
  - [ ] Vaccination
  - [ ] Deworming
  - [ ] MedicalOrder
  - [ ] Reminder
- [ ] Verificar permisos antes de eliminar
- [ ] Validar rollback en caso de error

#### **Archivado vs Eliminación**
- [ ] Revisar `/src/app/actions/archive-pet.ts`
- [ ] Considerar soft delete vs hard delete
- [ ] Validar lógica de restauración si existe

## 📊 Fase 2: Plan de Testing Básico

### 2.1 Unit Tests - Funciones Críticas

#### **Test Suite: User Registration**
```typescript
// __tests__/actions/user-registration.test.ts
```
- [ ] Test: Prevenir usuarios duplicados por email
- [ ] Test: Prevenir usuarios duplicados por teléfono
- [ ] Test: Validar campos requeridos
- [ ] Test: Sincronización correcta con Kinde

#### **Test Suite: Pet CRUD**
```typescript
// __tests__/actions/pet-crud.test.ts
```
- [ ] Test: Crear mascota con datos válidos
- [ ] Test: Prevenir creación sin usuario válido
- [ ] Test: Actualizar solo mascotas propias
- [ ] Test: Eliminar con cascada completa

#### **Test Suite: Delete Operations**
```typescript
// __tests__/actions/delete-operations.test.ts
```
- [ ] Test: Verificar transacción atómica
- [ ] Test: Validar permisos de usuario
- [ ] Test: Confirmar eliminación en cascada
- [ ] Test: Rollback en caso de error

### 2.2 Integration Tests - Flujos Completos

#### **Test: Flujo Completo de Cliente**
```typescript
// __tests__/integration/client-flow.test.ts
```
- [ ] Registrar usuario nuevo
- [ ] Agregar mascota
- [ ] Actualizar datos
- [ ] Buscar registros
- [ ] Eliminar mascota

#### **Test: Manejo de Duplicados**
```typescript
// __tests__/integration/duplicate-handling.test.ts
```
- [ ] Intentar crear usuario duplicado
- [ ] Verificar mensaje de error apropiado
- [ ] Validar estado consistente de DB

### 2.3 Database Tests

#### **Test: Integridad Referencial**
```typescript
// __tests__/database/referential-integrity.test.ts
```
- [ ] Verificar constraints de FK
- [ ] Validar cascadas configuradas
- [ ] Test de orphaned records

#### **Test: Índices y Performance**
```typescript
// __tests__/database/performance.test.ts
```
- [ ] Verificar índices necesarios
- [ ] Test de queries comunes
- [ ] Identificar N+1 queries

## 🛠️ Fase 3: Implementación de Mejoras

### 3.1 Prevención de Duplicados

#### **Implementar validación robusta**
- [ ] Agregar unique constraints en DB donde falten
- [ ] Implementar validación pre-insert
- [ ] Usar upsert donde sea apropiado
- [ ] Agregar índices únicos compuestos si necesario

#### **Mejorar manejo de concurrencia**
- [ ] Implementar locks optimistas
- [ ] Usar transacciones para operaciones complejas
- [ ] Agregar retry logic para conflictos

### 3.2 Mejoras en Eliminación

#### **Refactorizar delete operations**
- [ ] Verificar todas las relaciones antes de eliminar
- [ ] Implementar soft delete donde sea apropiado
- [ ] Mejorar mensajes de error
- [ ] Agregar confirmación de usuario

### 3.3 Logging y Monitoreo

#### **Implementar logging estructurado**
- [ ] Log de todas las operaciones CRUD
- [ ] Tracking de errores de duplicados
- [ ] Monitoreo de eliminaciones fallidas
- [ ] Alertas para operaciones críticas

## 📝 Fase 4: Documentación

### 4.1 Documentar Flujos CRUD
- [ ] Crear diagramas de flujo para cada operación
- [ ] Documentar validaciones y reglas de negocio
- [ ] Especificar manejo de errores

### 4.2 Guía de Testing
- [ ] Documentar cómo ejecutar tests
- [ ] Crear fixtures de datos de prueba
- [ ] Establecer cobertura mínima requerida

## ⚡ Quick Wins - Acciones Inmediatas

1. **Revisar y corregir** `/src/app/actions/delete-pets.ts`:
   - Verificar que la transacción incluya TODAS las tablas relacionadas
   - Agregar logs detallados para debugging

2. **Agregar validación** en `/src/app/api/user/register/route.ts`:
   - Implementar check de duplicados ANTES de intentar crear
   - Mejorar mensajes de error

3. **Crear test básico** para eliminación:
   ```typescript
   // __tests__/critical/delete-pet-safety.test.ts
   ```

4. **Implementar índice único** compuesto si necesario:
   ```prisma
   @@unique([email, phone])
   ```

## 🚨 Riesgos Identificados

1. **Condición de carrera** en registro de usuarios
2. **Eliminación incompleta** de registros relacionados
3. **Falta de validación** pre-insert para duplicados
4. **Ausencia de tests** para operaciones críticas

## 📅 Timeline Sugerido

- **Semana 1**: Revisión CRUD y fixes críticos
- **Semana 2**: Implementación de tests básicos
- **Semana 3**: Mejoras y refactoring
- **Semana 4**: Documentación y CI/CD

## 🎯 Métricas de Éxito

- [ ] 0 errores de duplicados en producción
- [ ] 100% de eliminaciones exitosas
- [ ] 80%+ cobertura en operaciones CRUD
- [ ] Tiempo de respuesta <200ms para operaciones básicas