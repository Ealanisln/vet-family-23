# TypeScript Critical Issues Tracking

**Status**: 🔴 104 errors (all in test files)
**Branch**: `fix/typescript-critical-issues`
**Last Updated**: 2025-10-28

## Overview

All TypeScript errors are currently in test files. **Production source code has zero TypeScript errors**, but `strict` mode is disabled. This tracking document focuses on fixing critical issues to enable strict type checking across the entire codebase.

---

## Critical Issues Summary

| Priority | Issue | Errors | Files Affected | Est. Effort |
|----------|-------|--------|----------------|-------------|
| 🔴 **P1** | Database schema mismatch in tests | 67 (65%) | 2 test files | 4-6 hours |
| 🔴 **P2** | Test mocking infrastructure gaps | 47 (45%) | 3 test files | 3-4 hours |
| 🟡 **P3** | `any` types in source code | 6 occurrences | 4 source files | 2-3 hours |
| 🟢 **P4** | TypeScript strict mode disabled | N/A | tsconfig.json | 1-2 hours |

**Total Estimated Effort**: 10-15 hours

---

## Priority 1: Database Schema Mismatch (67 errors) 🔴

**Root Cause**: Tests reference outdated Prisma models that were renamed or removed during schema evolution.

### Critical Model Mismatches

| Old (Used in Tests) | Current (Actual Schema) | Occurrences |
|---------------------|------------------------|-------------|
| `client` | `User` | 6+ |
| `medicalRecord` | `MedicalHistory` | 3+ |
| `movementHistory` | `InventoryMovement` | 1 |
| `sale`, `saleItem` | ❌ Removed from schema | 3+ |

### Property Mismatches

- `Pet.clientId` → `Pet.userId`
- `Appointment.notes` → ❌ Doesn't exist in schema
- `InventoryItem.stock` → ❌ Use `quantity` instead
- `Pet.dateOfBirth` → Missing in mock data (required field)

### Files to Fix

- [ ] `__tests__/database/prisma.integration.test.ts` (67 errors)
- [ ] `__tests__/utils/test-helpers.ts` (schema-related utilities)

### Action Items

- [ ] Replace all `client` references with `User`
- [ ] Replace all `medicalRecord` references with `MedicalHistory`
- [ ] Replace `movementHistory` with `InventoryMovement`
- [ ] Remove or refactor tests using deleted `sale`/`saleItem` models
- [ ] Update property names (`clientId` → `userId`)
- [ ] Remove references to non-existent properties (`Appointment.notes`, `InventoryItem.stock`)
- [ ] Add missing required fields to mock data (`Pet.dateOfBirth`)
- [ ] Run `pnpm typecheck` to verify fixes

---

## Priority 2: Test Mocking Infrastructure (47 errors) 🔴

**Root Cause**: Prisma and Kinde mocks lack proper type definitions for Jest methods.

### Prisma Mock Issues (30+ errors)

**Problem**: Tests attempt to use `.mockResolvedValue()` on Prisma client methods, but TypeScript doesn't recognize Jest mock methods.

```typescript
// ❌ CURRENT (doesn't type-check):
mockPrisma.user.findUnique.mockResolvedValue(mockDbUser)
//                          ^^^^^^^^^^^^^^^^^ TS2339: Property doesn't exist

// ✅ SOLUTION: Use jest-mock-extended or proper mock factory
```

### Kinde Auth Mock Issues (17 errors)

**Problem**: Incomplete mock object missing required methods from `KindeServerSession`.

**Missing Methods**:
- `refreshTokens()`
- `getBooleanFlag()`
- `getFlag()`
- `getIdToken()`
- Additional session management methods

### Action Items

- [ ] Install `jest-mock-extended`: `pnpm add -D jest-mock-extended`
- [ ] Create Prisma mock factory in `__tests__/utils/prisma-mock-factory.ts`
- [ ] Create Kinde auth mock factory in `__tests__/utils/kinde-mock-factory.ts`
- [ ] Update `__tests__/api/auth-status.test.ts` to use new Prisma mocking
- [ ] Update `__tests__/middleware/auth.middleware.test.ts` to use complete Kinde mock
- [ ] Add type declarations for mocked modules
- [ ] Run tests to verify mocks work correctly

---

## Priority 3: Remove `any` Types from Source Code (6 occurrences) 🟡

**Root Cause**: Lack of explicit type definitions for user data and third-party integrations.

### Files with `any` Types

| File | Line | Variable | Impact |
|------|------|----------|--------|
| `src/hooks/auth-status.ts` | 6 | `user: any` | Auth hook type safety |
| `src/sanity/lib/client.ts` | 15 | `source: any` | Image processing |
| `src/app/api/kinde-webhook/route.ts` | 35, 111 | `user: any`, `dbUser: any` | Webhook handling |
| `src/app/api/admin-check/route.ts` | 34 | `dbUser: any` | Admin verification |

### Proposed Type Definitions

Create `src/types/user.types.ts`:

```typescript
export interface KindeUser {
  id: string
  given_name?: string
  family_name?: string
  email: string
  picture?: string
}

export interface DbUser {
  id: string
  kindeId: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface SanityImageSource {
  asset: {
    _ref: string
    _type: string
  }
}
```

### Action Items

- [ ] Create `src/types/user.types.ts` with proper interfaces
- [ ] Update `src/hooks/auth-status.ts`: Replace `user: any` with `KindeUser`
- [ ] Update `src/app/api/kinde-webhook/route.ts`: Replace `any` with typed interfaces
- [ ] Update `src/app/api/admin-check/route.ts`: Use `DbUser` interface
- [ ] Update `src/sanity/lib/client.ts`: Add `SanityImageSource` type
- [ ] Run `pnpm typecheck` to verify no errors
- [ ] Test auth flows to ensure runtime behavior unchanged

---

## Priority 4: Enable TypeScript Strict Mode 🟢

**Current Config** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "strict": false  // ❌ Disabled
  }
}
```

**Target Config**:
```json
{
  "compilerOptions": {
    "strict": true   // ✅ Enabled
  }
}
```

### What Strict Mode Enables

- `noImplicitAny`: Prevents implicit `any` types
- `strictNullChecks`: Requires explicit null/undefined handling
- `strictFunctionTypes`: Stricter function type checking
- `strictBindCallApply`: Type-checks bind/call/apply
- `strictPropertyInitialization`: Ensures class properties are initialized
- `noImplicitThis`: Requires explicit `this` type
- `alwaysStrict`: Emits "use strict" in JS output

### Action Items

- [ ] Ensure Priorities 1-3 are completed first
- [ ] Update `tsconfig.json`: Set `"strict": true`
- [ ] Run `pnpm typecheck` to identify new errors
- [ ] Fix any new errors that surface (estimate: 0-10 new errors)
- [ ] Run test suite: `pnpm test`
- [ ] Verify build succeeds: `pnpm build:safe`
- [ ] Document any intentional suppressions

---

## Testing Checklist

After completing all priorities, verify:

- [ ] `pnpm typecheck` passes with 0 errors
- [ ] `pnpm test` passes all test suites
- [ ] `pnpm build:safe` completes successfully
- [ ] No `any` types remain in critical auth paths
- [ ] Strict mode enabled in tsconfig.json
- [ ] All test mocks have proper type definitions

---

## Configuration Status

### Current TypeScript Setup

**`tsconfig.json`**:
- TypeScript Version: 5.1.6
- Target: ES2022
- Module: ESNext
- Strict Mode: ❌ **Disabled**
- Skip Lib Check: ✅ Enabled (hides external type errors)
- Path Aliases: `@/*` configured

**Known Config Issues**:
- Main config uses `moduleResolution: bundler` while test config uses `node` (inconsistency)
- `isolatedModules: false` in test config (overrides main)

---

## Progress Tracking

### Phase 1: Critical Schema Fixes
- [ ] Update Prisma integration tests
- [ ] Update test helper utilities
- [ ] Verify 67 errors resolved

### Phase 2: Mocking Infrastructure
- [ ] Install jest-mock-extended
- [ ] Create Prisma mock factory
- [ ] Create Kinde mock factory
- [ ] Update all test files
- [ ] Verify 47 errors resolved

### Phase 3: Type Safety Improvements
- [ ] Create user type definitions
- [ ] Remove all `any` from source files
- [ ] Verify 6 occurrences replaced

### Phase 4: Enable Strict Mode
- [ ] Enable strict mode
- [ ] Fix any new errors
- [ ] Full test suite passes
- [ ] Build verification succeeds

---

## Success Criteria

✅ **Definition of Done**:
1. Zero TypeScript errors: `pnpm typecheck` passes
2. All tests passing: `pnpm test` succeeds
3. Build completes: `pnpm build:safe` succeeds
4. Strict mode enabled: `tsconfig.json` has `"strict": true`
5. No `any` types in critical code paths
6. Type-safe test infrastructure in place

---

## Notes & Observations

- ✅ **Good**: Production source code already has zero TypeScript errors
- ✅ **Good**: No `@ts-ignore` or `@ts-expect-error` comments found
- ⚠️ **Concern**: Large gap between Prisma schema and test fixtures
- 💡 **Recommendation**: Consider adding schema change validation to prevent future drift
- 💡 **Future**: Add pre-commit hook to enforce type checking

---

## Related Documentation

- [Next.js 15 Migration](./NEXTJS_15_MIGRATION.md)
- [Environment Setup](./ENVIRONMENT_SETUP.md)
- [Phase 1 Fixes](./to-implement/phase1-fixes-implemented.md)
