# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vet Family is a comprehensive veterinary clinic management system built with Next.js 15, React 19, Prisma ORM (PostgreSQL), TypeScript, and Kinde authentication. The application supports client-facing features (appointments, pet profiles) and a full admin dashboard for clinic operations including medical records, inventory management, vaccinations, and deworming schedules.

**Key Technologies:**
- **Next.js 15** with App Router (React 19)
- **PostgreSQL** database via Prisma ORM
- **Kinde Auth** for authentication
- **Sanity CMS** for blog content (mounted at `/studio`)
- **TailwindCSS** + Radix UI components
- **Cloudinary** for image management
- **pnpm** as package manager

## Development Commands

### Local Development
```bash
pnpm dev                    # Start dev server with .env.local
pnpm dev:staging           # Start dev server with .env.development
```

### Building
```bash
pnpm build                 # Standard build (generates Prisma client first)
pnpm build:safe           # Build with IS_BUILD_TIME=true (uses mock Prisma client)
pnpm build:development    # Build using .env.development
pnpm build:production     # Build using .env.production
```

### Testing
```bash
pnpm test                  # Run all tests
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Generate coverage report
pnpm test:ci              # Run tests in CI mode

# Specific test suites
pnpm test:integration     # Run integration tests
pnpm test:middleware      # Run middleware tests
pnpm test:api             # Run API tests
pnpm test:auth            # Run auth tests
pnpm test:db              # Run database tests
pnpm test:e2e             # Run Playwright E2E tests
pnpm test:e2e:ui          # Run Playwright with UI
```

### Code Quality
```bash
pnpm lint                 # Run Next.js ESLint
pnpm lint:strict         # Fail on any warnings (max-warnings=0)
pnpm lint:fix            # Auto-fix linting issues
pnpm typecheck           # Run TypeScript compiler checks
```

### Database Operations
```bash
pnpm db:push             # Push schema changes to database (with .env.local)
pnpm db:generate         # Generate Prisma client
pnpm db:migrate          # Deploy migrations
pnpm db:studio           # Open Prisma Studio
pnpm db:reset            # Reset database (WARNING: destructive)
```

### Other Commands
```bash
pnpm import-data         # Import data from scripts/import-data.ts
pnpm backup              # Run backup script
pnpm verify-backup       # Verify backup integrity
pnpm setup:env           # Setup environment files
pnpm setup:kinde         # Update Kinde configuration
```

## Architecture

### Route Structure
The application uses Next.js 15 App Router with **route groups** to organize pages:

- **`(main)`** - Public client-facing pages with main navbar/footer layout
  - `/` - Home page
  - `/cliente` - Client dashboard (protected)
  - `/reservar-cita` - Book appointment
  - `/promociones` - Promotions page
  - `/planes-veterinarios` - Veterinary plans
  - `/microchip` - Microchip info
  - `/hotel-mascotas` - Pet hotel info

- **`(contact)`** - Blog and contact pages with alternate layout
  - `/blog` - Blog listing (Sanity CMS)
  - `/blog/[slug]` - Individual blog posts

- **`(admin)`** - Protected admin dashboard
  - `/admin` - Main dashboard
  - `/admin/clientes` - Client management
  - `/admin/mascotas` - Pet management
  - `/admin/usuarios` - User management
  - `/admin/inventario` - Inventory management (medicines, vaccines, products)

- **`/studio`** - Sanity CMS Studio (catch-all route `[[...index]]`)

### Authentication Flow

**Provider:** Kinde (configured in `src/lib/kinde-config.ts`)

The middleware (`src/middleware.ts`) protects `/admin/*` routes with a sophisticated approach:
1. Public routes (/, /blog, /promociones) bypass auth
2. Static assets and auth routes bypass immediately
3. Admin routes check authentication and redirect to `/api/auth/login` if needed
4. **Fallback mechanism**: `src/lib/auth-utils.ts` provides `getAuthenticatedUser()` and `getFallbackUser()` for graceful degradation when auth fails

**Important**: The app uses a **fallback user strategy** in admin layouts to handle Next.js 15 async auth issues during development. See `src/app/(admin)/admin/layout.tsx` for implementation.

### Database Architecture

**Prisma Client** is configured with special build-time handling in `src/lib/prismaDB.ts`:
- During builds (`IS_BUILD_TIME=true`), a mock Prisma client is used to prevent connection errors
- In runtime, lazy initialization ensures proper connection pooling
- `safePrismaOperation()` helper wraps queries with fallback values for build safety

**Key Models:**
- `User` - Stores user profiles (linked to Kinde via `kindeId`)
- `Pet` - Pet records with `internalId`, species, breed, medical history
- `MedicalHistory` - Visit records with diagnosis, treatment, prescriptions
- `Vaccination` & `VaccinationSchedule` - Vaccine tracking with stages (PUPPY/ADULT)
- `Deworming` & `DewormingSchedule` - Deworming tracking
- `InventoryItem` - Medicines, vaccines, food, accessories with categories
- `InventoryMovement` - Stock tracking (IN/OUT/ADJUSTMENT/RETURN/EXPIRED)
- `MedicalOrder` & `MedicalOrderProduct` - Orders linking inventory to medical records
- `Appointment`, `Billing`, `Reminder` - Supporting models

**Important Enums:**
- `VaccineType` - DP_PUPPY, DHPPI, DHPPI_L, RABIES, TRIPLE_FELINA, etc.
- `InventoryCategory` - 36 categories including MEDICINE, VACCINE, ANTIBIOTIC, FOOD, etc.
- `VaccinationStatus/DewormingStatus` - PENDING, COMPLETED, OVERDUE, SCHEDULED

### Server Actions Pattern

Server actions are centralized in `src/app/actions/` using `"use server"` directive:
- `get-customers.ts` - Fetch/search clients
- `get-pets.ts` - Fetch pets with filters
- `add-edit-pet.ts` - CRUD for pets
- `add-medical-record.ts` - Create medical history entries
- `deworming.ts` - Deworming management
- `vaccination.ts` - Vaccination management
- `email.ts` - SendGrid email notifications

**Pattern**: Actions return `{ success: boolean, data?: T, error?: string }` for consistent error handling.

### Component Structure

- **`src/components/ui/`** - Radix UI primitives (button, dialog, card, etc.)
- **`src/components/Admin/`** - Admin-specific components
- **`src/components/Clientes/`** - Client management tables and forms
- **`src/components/Inventory/`** - Inventory management UI
- **`src/components/Vaccination/`** & **`src/components/Deworming/`** - Medical tracking
- **`src/components/Pet/`** - Pet forms and detail views

### Path Aliases

TypeScript and Next.js are configured with:
```typescript
"@/*": ["./src/*"]
"@/public/*": ["./public/*"]
```

Use `@/` imports consistently throughout the codebase.

### Sanity CMS Integration

Blog content is managed via Sanity:
- **Studio**: Mounted at `/studio` (see `src/app/studio/[[...index]]/page.tsx`)
- **Content**: Blog posts with categories, authors, SEO fields
- **Queries**: Centralized in `src/sanity/lib/queries.ts`
- **Client**: Configured in `src/sanity/lib/client.ts` with `apiVersion` from `src/sanity/env.ts`

### Environment Variables

The app uses environment-specific configs:
- `.env.local` - Local development
- `.env.development` - Staging/development deployment
- `.env.production` - Production deployment

**Required variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `KINDE_*` - Kinde authentication credentials
- `NEXT_PUBLIC_SITE_URL` - Site URL for redirects
- Sanity, Cloudinary, SendGrid, Google Maps API keys

## Important Patterns & Conventions

### Next.js 15 Async Considerations

Next.js 15 made several APIs async (like `cookies()`). The codebase handles this with:
1. **Await cookies**: `const cookieStore = await cookies()`
2. **Server Actions**: Properly marked with `"use server"` and return promises
3. **Middleware**: Uses robust error handling for auth state checks

### Build-Time Safety

The `IS_BUILD_TIME` environment variable signals when to skip database operations:
- Set via `pnpm build:safe`
- Triggers mock Prisma client in `src/lib/prismaDB.ts`
- Prevents build failures due to missing DATABASE_URL

### Admin Layout Pattern

The admin layout (`src/app/(admin)/admin/layout.tsx`) uses:
1. Server-side auth check with fallback user
2. Client component (`AdminLayoutClient.tsx`) for interactive UI
3. Anti-cache headers to prevent stale admin data

### Testing Strategy

- **Unit Tests**: Jest with `@testing-library/react` for components
- **Integration Tests**: API route testing with supertest
- **E2E Tests**: Playwright for critical user flows
- **Coverage Thresholds**: Set to 10-15% (low for MVP stage)

**Test file patterns:**
- `**/__tests__/**/*.test.[jt]s?(x)`
- `**/?(*.)+(spec|test).[jt]s?(x)`

### Deployment

The project uses `output: 'standalone'` in `next.config.js` for optimized Docker deployments.

**Deployment commands:**
```bash
pnpm deploy:dev    # Deploy to development
pnpm deploy:prod   # Deploy to production
```

## Common Development Workflows

### Adding a New Model
1. Update `prisma/schema.prisma`
2. Run `pnpm db:push` (development) or create migration
3. Generate client: `pnpm db:generate`
4. Create TypeScript types in `src/types/`
5. Add server actions in `src/app/actions/`
6. Build UI components

### Adding a New Admin Feature
1. Create route in `src/app/(admin)/admin/[feature]/`
2. Add page.tsx with auth check
3. Create components in `src/components/Admin/`
4. Add navigation entry to admin sidebar
5. Write server actions for data fetching
6. Test with `pnpm test:integration`

### Working with Inventory
The inventory system has complex category enums. Always reference `prisma/schema.prisma` for the complete list of `InventoryCategory` values (36 categories).

### Testing Database Changes
1. Make schema changes
2. Test with `pnpm db:push`
3. Verify with Prisma Studio: `pnpm db:studio`
4. Write tests: `pnpm test:db`
5. Check coverage: `pnpm test:coverage`

## Known Issues & Workarounds

1. **Next.js 15 Cookies Promise**: Always await `cookies()` - common error source
2. **Kinde Auth Reliability**: Fallback user mechanism in place for dev stability
3. **Build-Time DB Access**: Use `pnpm build:safe` if DATABASE_URL is unavailable
4. **Middleware Redirect Loops**: Middleware checks referer to prevent auth loops

## Analytics & Monitoring

The app integrates:
- **Google Analytics**: GA4 via `@next/third-parties/google`
- **Facebook Pixel**: Custom implementation in `src/components/Facebook/FacebookPixel.tsx`
- **Umami Analytics**: Self-hosted analytics script

## Code Style

- TypeScript with `strict: false` (incremental adoption)
- ESLint with Next.js config
- Prefer function components with hooks
- Server components by default; mark `"use client"` explicitly
- Use `@/` path aliases consistently
