Voy a ayudarte a crear un plan de remoción para el feature de POS. Primero, déjame explorar la estructura del proyecto para entender mejor cómo está implementado el POS.Ahora voy a buscar referencias en la base de datos (Prisma):Ahora voy a buscar archivos específicos del POS:Voy a revisar las tablas en el schema de Prisma:Ahora voy a revisar las migraciones relacionadas con POS:Ahora voy a verificar si hay otras migraciones que modifiquen las tablas del POS:Ahora voy a verificar referencias en package.json:Basándome en mi análisis del código, aquí está el plan de remoción del feature POS:

# Plan de Remoción del Sistema POS

## 1. Análisis de Impacto

### Tablas de Base de Datos Afectadas
- `Sale`
- `SaleItem`
- `Service`
- `CashDrawer`
- `CashTransaction`
- Enums: `PaymentMethod`, `SaleStatus`, `ServiceCategory`, `DrawerStatus`, `TransactionType`

### Relaciones con Otras Entidades
- `Sale` → `User` (userId)
- `Sale` → `Pet` (petId)
- `Sale` → `MedicalOrder` (relación inversa)
- `SaleItem` → `InventoryItem` (itemId)
- `CashDrawer` → `User` (openedBy, closedBy)

## 2. Plan de Remoción por Fases

### Fase 1: Preparación y Backup

1. **Crear backup completo de la base de datos**
2. **Documentar datos existentes del POS** (si los hay)
3. **Crear rama de trabajo**: `feature/remove-pos-system`

### Fase 2: Remoción del Frontend

#### 2.1 Eliminar Rutas y Páginas
```
src/app/(admin)/admin/pos/
├── apertura-caja/
├── cierre-caja/
├── inventario/
│   └── precios/
├── productos/
├── servicios/
│   ├── nuevo/
│   └── [id]/
├── ventas/
│   ├── nueva/
│   └── [id]/
├── ClientLayout.tsx
├── layout.tsx
└── page.tsx
```

#### 2.2 Eliminar Componentes
```
src/components/POS/
├── BulkPriceAdjustment.tsx
├── CartSummary.tsx
├── CashDrawer/
│   ├── CloseDrawerForm.tsx
│   ├── OpenDrawerForm.tsx
│   └── TransactionHistory.tsx
├── ClientSelectionDialog.tsx
├── MarginCalculator.tsx
├── PetSelectionDialog.tsx
├── PriceForm.tsx
├── ProductCard.tsx
├── Sales/
│   ├── Cart.tsx
│   ├── PaymentForm.tsx
│   ├── ProductSearch.tsx
│   ├── Receipt.tsx
│   ├── SaleForm.tsx
│   ├── SalesPagination.tsx
│   ├── SalesTable.tsx
│   └── ServiceSearch.tsx
├── ServiceCard.tsx
└── Services/
    ├── ServiceActions.tsx
    ├── ServiceForm.tsx
    └── ServicesTable.tsx
```

#### 2.3 Actualizar Navegación
- **src/components/Admin/Sidebar/app-sidebar.tsx**: Remover enlaces POS (líneas ~83-101)
- **src/components/Admin/Sidebar/nav-main.tsx**: Remover items de navegación POS (línea ~46-48)

### Fase 3: Remoción del Backend

#### 3.1 Eliminar Endpoints API
```
src/app/api/pos/
├── inventory/
│   └── price/
│       ├── preview/
│       └── route.ts
├── sales/
│   └── route.ts
└── services/
    └── route.ts
```

#### 3.2 Eliminar Server Actions
```
src/app/actions/pos/
├── cash-drawer.ts
├── inventory-price.ts
├── inventory.ts
├── load-sale-page.ts
├── sales.ts
└── services.ts
```

#### 3.3 Actualizar Otros Archivos API
- **src/app/api/inventory/[id]/price/route.ts**: Remover lógica POS (línea ~110)
- **src/app/api/user/register/route.ts**: Remover permisos POS (líneas ~178, 340, 369)
- **src/app/api/admin/users/route.ts**: Remover referencias POS (líneas ~73-74, 133)
- **src/app/api/admin/assign-role/route.ts**: Remover roles POS
- **src/app/api/kinde-webhook/route.ts**: Remover lógica POS (línea ~181)
- **src/app/api/kinde-token/route.ts**: Remover permisos POS (líneas ~44, 98)

### Fase 4: Limpieza de Código

#### 4.1 Actualizar Archivos de Utilidades
- **src/utils/pos-helpers.ts**: Eliminar archivo completo
- **src/types/pos.ts**: Eliminar archivo completo
- **src/types/inventory.ts**: Remover tipos relacionados con POS

#### 4.2 Actualizar Contextos
- **src/contexts/CartContext.tsx**: Eliminar si solo se usa para POS

#### 4.3 Limpiar Referencias en Componentes
- **src/components/ClienteForm/index.tsx**: Remover referencia POS (línea ~46)
- **src/components/User/RegistrationForm.tsx**: Remover campo POS (línea ~65)
- **src/components/BlogNavbar/Registerdialog.tsx**: Remover lógica POS (línea ~70)
- **src/components/BlogNavbar/Signdialog.tsx**: Remover lógica POS (línea ~69)
- **src/app/(admin)/admin/AdminDashboard.tsx**: Remover widgets POS (líneas ~176-193, 285-287)
- **src/app/(admin)/admin/usuarios/page.tsx**: Remover columna POS (línea ~63)

#### 4.4 Actualizar Middleware
- **src/middleware.ts**: Remover rutas protegidas POS (líneas ~35-36, 56, 60, 89)

### Fase 5: Migración de Base de Datos

#### 5.1 Crear Nueva Migración
```sql
-- DropForeignKey (primero eliminar relaciones)
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_userId_fkey";
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_petId_fkey";
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_saleId_fkey";
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_itemId_fkey";
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_serviceId_fkey";
ALTER TABLE "CashDrawer" DROP CONSTRAINT "CashDrawer_openedBy_fkey";
ALTER TABLE "CashDrawer" DROP CONSTRAINT "CashDrawer_closedBy_fkey";
ALTER TABLE "CashTransaction" DROP CONSTRAINT "CashTransaction_drawerId_fkey";
ALTER TABLE "CashTransaction" DROP CONSTRAINT "CashTransaction_saleId_fkey";

-- DropTable
DROP TABLE "CashTransaction";
DROP TABLE "CashDrawer";
DROP TABLE "Service";
DROP TABLE "SaleItem";
DROP TABLE "Sale";

-- DropEnum
DROP TYPE "PaymentMethod";
DROP TYPE "SaleStatus";
DROP TYPE "ServiceCategory";
DROP TYPE "DrawerStatus";
DROP TYPE "TransactionType";
```

#### 5.2 Actualizar Schema Prisma
- Remover modelos: `Sale`, `SaleItem`, `Service`, `CashDrawer`, `CashTransaction`
- Remover enums relacionados
- Actualizar relaciones en modelos `User` y `Pet`
- Remover relación `MedicalOrder` con `Sale`

### Fase 6: Testing y Validación

1. **Ejecutar tests unitarios** actualizados
2. **Verificar que no hay imports rotos**
3. **Buscar referencias residuales**: 
   ```bash
   grep -r "pos\|POS\|Sale\|Service\|CashDrawer" src/
   ```
4. **Verificar compilación TypeScript**
5. **Ejecutar build de producción**

### Fase 7: Documentación y Despliegue

1. **Actualizar README.md** para remover referencias POS
2. **Actualizar variables de entorno** si las hay
3. **Crear PR con todos los cambios**
4. **Desplegar en ambiente de staging**
5. **Validar funcionalidad completa**
6. **Desplegar en producción**

## Consideraciones Importantes

### Datos Existentes
- Verificar si hay datos de ventas existentes que necesiten ser archivados
- Considerar exportar datos históricos antes de eliminar tablas

### Dependencias de Inventario
- El sistema de inventario parece tener algunas dependencias con POS
- Verificar que la funcionalidad de inventario siga funcionando sin POS

### Permisos y Roles
- Actualizar el sistema de permisos para remover roles relacionados con POS
- Verificar que usuarios existentes no queden con permisos rotos

### Frontend Components
- Algunos componentes pueden ser compartidos con otras features
- Verificar antes de eliminar que no se usen en otros lugares

Este plan asegura una remoción limpia y segura del sistema POS sin afectar otras funcionalidades del sistema.