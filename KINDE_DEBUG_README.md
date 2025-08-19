# 🔧 Kinde Authentication Debug Guide

## ✅ Problemas Resueltos

### 1. **Errores de Prisma Schema**
- ❌ **Problema**: Usaba `dbUser.userRoles` en lugar de `dbUser.UserRole`
- ✅ **Solución**: Corregido en `auth-status/route.ts` y `kinde-webhook/route.ts`

### 2. **Endpoint Complejo y Frágil**
- ❌ **Problema**: `/api/auth-status` era demasiado complejo y fallaba intermitentemente
- ✅ **Solución**: Creado `/api/admin-check` más simple y robusto

### 3. **Redirecciones Incorrectas**
- ❌ **Problema**: Todos los formularios redirigían a `/admin/mascotas` sin verificar permisos
- ✅ **Solución**: Verificación dinámica de roles antes de redirigir

## 🚀 Como Probar el Fix

### 1. **Usar el Script de Debug**
```bash
node debug-auth.js
```

### 2. **Verificar Logs en Consola**
Los formularios ahora muestran logs detallados:
```javascript
console.log('Auth check result:', authData);
```

### 3. **Probar Diferentes Escenarios**
1. **Usuario Admin**: Debería ir a `/admin/mascotas`
2. **Usuario Regular**: Debería ir al cliente específico
3. **Error de Verificación**: Debería usar fallback seguro

## 🔍 Endpoints de Debug

### `/api/admin-check` (NUEVO - RECOMENDADO)
```json
{
  "isAdmin": true,
  "isAuthenticated": true, 
  "userId": "user_id",
  "userEmail": "user@example.com"
}
```

### `/api/auth-status` (MEJORADO)
```json
{
  "user": { /* user data */ },
  "isAuthenticated": true,
  "dbUser": { /* db user data */ },
  "roles": [{ "key": "admin", "name": "Administrator" }],
  "isAdmin": true
}
```

## 🐛 Como Debuggear Problemas Futuros

### 1. **Revisar Logs del Servidor**
```bash
# En desarrollo
npm run dev

# En producción (Vercel)
# Revisa los Function Logs en Vercel Dashboard
```

### 2. **Verificar Roles en Base de Datos**
```sql
SELECT u.email, u.kindeId, r.key as role_key
FROM "User" u
LEFT JOIN "UserRole" ur ON u.id = ur.userId  
LEFT JOIN "Role" r ON ur.roleId = r.id
WHERE u.email = 'tu@email.com';
```

### 3. **Verificar Configuración de Kinde**
- Dashboard de Kinde → Users → [usuario] → Roles
- Asegurate que el rol "admin" esté asignado

## 📊 Flujo de Verificación Actual

```
1. Usuario agrega mascota
   ↓
2. Llama a /api/admin-check
   ↓
3. Verifica roles en Kinde Y base de datos
   ↓
4. Redirige basado en resultado:
   - Admin + /admin/ path → /admin/mascotas
   - No admin + /admin/ path → /admin/clientes/[id]
   - Contexto cliente → /cliente
   - Error → Fallback seguro
```

## 🚨 Señales de Problemas

### Si aún hay redirecciones raras:
1. **Revisar logs de consola** para ver resultado de auth-check
2. **Verificar que los roles estén sincronizados** entre Kinde y DB
3. **Comprobar que no hay errores de JavaScript** en el navegador

### Si el endpoint /api/admin-check falla:
1. **Verificar variables de entorno** de Kinde
2. **Comprobar conexión a base de datos**
3. **Revisar que el usuario existe** en ambos sistemas
