# 🌍 Environment Setup Guide - VetForFamily

Esta guía te ayudará a configurar los diferentes environments para el proyecto VetForFamily.

## 📋 Environments Disponibles

| Environment | Domain | Descripción |
|-------------|--------|-------------|
| **Local** | `localhost:3000` | Desarrollo local |
| **Development** | `development.vetforfamily.com` | Staging/Testing |
| **Production** | `vetforfamily.com` | Producción |

## 🚀 Setup Inicial

### 1. Generar Archivos de Environment

```bash
# Generar archivos .env.development y .env.production
pnpm run setup:env
```

Este comando creará:
- `.env.development` - Para development.vetforfamily.com
- `.env.production` - Para vetforfamily.com

### 2. Configurar Kinde Authentication

#### Para Development Environment:

1. Ve a [Kinde Admin](https://vetfamily.kinde.com/admin)
2. Crea una nueva aplicación:
   - **Nombre**: "VetForFamily Development"
   - **Tipo**: "Regular web app"
3. Configura las URLs:
   - **Allowed callback URLs**: `https://development.vetforfamily.com/api/auth/kinde_callback`
   - **Allowed logout redirect URLs**: `https://development.vetforfamily.com`
   - **Allowed origins**: `https://development.vetforfamily.com`
4. Crea también una aplicación **Machine to Machine** para API access
5. Copia las credenciales y actualiza:

```bash
# Actualizar credenciales de development
pnpm run setup:kinde development [CLIENT_ID] [CLIENT_SECRET] [M2M_CLIENT_ID] [M2M_CLIENT_SECRET]
```

#### Para Production Environment:

1. Actualiza la aplicación existente o crea una nueva
2. Configura las URLs:
   - **Allowed callback URLs**: `https://vetforfamily.com/api/auth/kinde_callback`
   - **Allowed logout redirect URLs**: `https://vetforfamily.com`
   - **Allowed origins**: `https://vetforfamily.com`
3. Actualiza las credenciales:

```bash
# Actualizar credenciales de production
pnpm run setup:kinde production [CLIENT_ID] [CLIENT_SECRET] [M2M_CLIENT_ID] [M2M_CLIENT_SECRET]
```

## 🔧 Configuración de Base de Datos

### Development Database
- Usa una base de datos separada para development
- Configurada en `.env.development`
- Permite testing sin afectar producción

### Production Database
- Base de datos principal
- Configurada en `.env.production`
- Datos reales de la aplicación

## 🏃‍♂️ Comandos de Desarrollo

```bash
# Desarrollo local (localhost:3000)
pnpm run dev

# Development environment (development.vetforfamily.com)
pnpm run dev:staging

# Verificar configuración de environment
pnpm run env:check
```

## 🚀 Comandos de Build y Deploy

```bash
# Build para development
pnpm run build:development

# Build para production
pnpm run build:production

# Deploy a development
pnpm run deploy:dev

# Deploy a production
pnpm run deploy:prod
```

## 📁 Estructura de Archivos de Environment

```
.env.local          # Desarrollo local (no commitear)
.env.development    # Development/Staging environment
.env.production     # Production environment
```

### Variables Importantes por Environment:

#### Development (.env.development)
```env
NODE_ENV="development"
NEXT_PUBLIC_SITE_URL="https://development.vetforfamily.com"
KINDE_SITE_URL="https://development.vetforfamily.com"
NEXT_PUBLIC_SANITY_DATASET="development"
MY_EMAIL="dev@vetforfamily.com"
```

#### Production (.env.production)
```env
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://vetforfamily.com"
KINDE_SITE_URL="https://vetforfamily.com"
NEXT_PUBLIC_SANITY_DATASET="production"
MY_EMAIL="contacto@vetforfamily.com"
```

## 🔐 Seguridad

### Variables Sensibles
- Nunca commitear archivos `.env*` al repositorio
- Usar diferentes credenciales para cada environment
- Rotar secrets regularmente

### Kinde Security
- Configurar dominios específicos para cada environment
- Usar diferentes aplicaciones para development y production
- Habilitar HTTPS en todos los environments

## 🧪 Testing

### Verificar Environment
```bash
# Verificar que las variables están cargadas correctamente
pnpm run env:check

# Test de build
pnpm run build:development
pnpm run build:production
```

### Verificar Kinde Configuration
1. Intentar login en cada environment
2. Verificar redirects funcionan correctamente
3. Confirmar que las cookies se configuran apropiadamente

## 🔄 Workflow de Deployment

### Development Environment
1. Hacer cambios en branch `development`
2. Push a repositorio
3. Ejecutar: `pnpm run deploy:dev`
4. Verificar en `https://development.vetforfamily.com`

### Production Environment
1. Merge cambios a branch `main`
2. Ejecutar: `pnpm run deploy:prod`
3. Confirmar deployment
4. Verificar en `https://vetforfamily.com`

## 🐛 Troubleshooting

### Error: "Kinde credentials not configured"
```bash
# Verificar que las credenciales están configuradas
cat .env.development | grep KINDE_CLIENT_ID
cat .env.production | grep KINDE_CLIENT_ID

# Si aparece "YOUR_DEV_CLIENT_ID_HERE", actualizar:
pnpm run setup:kinde [environment] [credentials...]
```

### Error: "Environment file not found"
```bash
# Regenerar archivos de environment
pnpm run setup:env
```

### Error de CORS o Redirect
- Verificar que las URLs en Kinde coinciden exactamente
- Confirmar que HTTPS está habilitado
- Revisar configuración de cookies en `KINDE_COOKIE_DOMAIN`

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisar logs de build/deployment
2. Verificar configuración de Kinde
3. Confirmar que los dominios están configurados correctamente
4. Contactar al equipo de desarrollo

---

**Nota**: Esta configuración permite manejar múltiples environments de manera segura y eficiente, facilitando el desarrollo y deployment del proyecto VetForFamily. 