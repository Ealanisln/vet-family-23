# Veterinary Management System - Testing Suite

This directory contains comprehensive tests for the veterinary management system to ensure production readiness.

## 🧪 Test Structure

```
__tests__/
├── api/                    # API endpoint tests
│   ├── auth-status.test.ts
│   └── pos-sales.test.ts
├── database/               # Database integration tests
│   └── prisma.integration.test.ts
├── integration/            # End-to-end integration tests
├── middleware/             # Middleware tests
│   └── auth.middleware.test.ts
├── mocks/                  # Mock data and handlers
│   └── handlers.ts
├── utils/                  # Testing utilities
│   └── test-helpers.ts
└── tsconfig.json          # TypeScript config for tests
```

## 🚀 Running Tests

### Install Dependencies
```bash
pnpm install
```

### Run All Tests
```bash
pnpm test
```

### Run Tests by Category
```bash
# Authentication & Middleware tests
pnpm test:middleware

# API endpoint tests
pnpm test:api

# Database integration tests
pnpm test:db

# Integration tests
pnpm test:integration
```

### Watch Mode (Development)
```bash
pnpm test:watch
```

### Coverage Report
```bash
pnpm test:coverage
```

### CI/CD Pipeline
```bash
pnpm test:ci
```

## 🔍 Critical Path Testing (Priority 1)

### Authentication & Authorization
- ✅ Login Flow: Test Kinde authentication integration
- ✅ Protected Routes: Verify middleware.ts protects admin routes
- ✅ Role-based Access: Test different user roles (admin, vet, staff)
- ✅ Session Management: Test token refresh and logout
- ✅ API Authentication: Verify API routes require proper auth

**Test Files:**
- `middleware/auth.middleware.test.ts`
- `api/auth-status.test.ts`

### Core Business Logic
- ✅ Patient Management: Create, read, update, delete pets
- ✅ Appointment System: Scheduling, updates, cancellations
- ✅ Medical Records: Add/view medical history
- ✅ Billing System: Invoice generation and payment tracking
- ✅ Inventory Management: Stock tracking and updates

**Test Files:**
- `api/pos-sales.test.ts`
- `database/prisma.integration.test.ts`

### Database Operations
- ✅ Prisma Client: All model operations work correctly
- ✅ Relationships: Foreign keys and joins function properly
- ✅ Transactions: Complex operations maintain data integrity
- ✅ Migrations: Schema changes applied correctly

**Test Files:**
- `database/prisma.integration.test.ts`

### API Endpoints Testing
- ✅ REST API Routes: CRUD operations for all entities
- ✅ Authentication: All protected routes verify auth
- ✅ Validation: Input validation and error handling
- ✅ Performance: Response times within acceptable limits

## 📊 Test Coverage Goals

- **Minimum Coverage**: 80%
- **Critical Paths**: 95%
- **API Endpoints**: 90%
- **Database Operations**: 95%

## 🛠️ Test Environment Setup

### Prerequisites
1. **Database**: PostgreSQL instance for testing
2. **Environment Variables**: Test-specific configurations
3. **Dependencies**: All testing libraries installed

### Environment Variables
Create a `.env.test` file:
```env
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/vet_family_test
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/vet_family_test
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard
```

### Database Setup
```bash
# Create test database
createdb vet_family_test

# Run migrations
pnpm prisma migrate deploy --schema=./prisma/schema.prisma

# Seed test data (optional)
pnpm prisma db seed
```

## 🧪 Test Categories

### Unit Tests
- **Purpose**: Test individual functions and components
- **Scope**: Pure functions, utilities, helpers
- **Fast execution**: < 100ms per test

### Integration Tests
- **Purpose**: Test interactions between components
- **Scope**: API routes, database operations, external services
- **Medium execution**: < 1s per test

### End-to-End Tests
- **Purpose**: Test complete user workflows
- **Scope**: Full application scenarios
- **Slower execution**: < 30s per test

## 📋 Test Checklist

### Before Production Deployment

#### Authentication Tests ✅
- [ ] User login/logout flows
- [ ] Session management
- [ ] Role-based access control
- [ ] Password reset functionality
- [ ] Multi-factor authentication (if enabled)

#### API Endpoint Tests ✅
- [ ] All CRUD operations work correctly
- [ ] Proper HTTP status codes returned
- [ ] Input validation working
- [ ] Error handling implemented
- [ ] Rate limiting (if implemented)

#### Database Tests ✅
- [ ] All models can be created/updated/deleted
- [ ] Foreign key constraints enforced
- [ ] Transactions work correctly
- [ ] Data integrity maintained
- [ ] Performance within acceptable limits

#### Business Logic Tests ✅
- [ ] Pet registration workflow
- [ ] Appointment scheduling
- [ ] Medical record creation
- [ ] Inventory management
- [ ] Sales and billing processes

#### Security Tests
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] Authorization bypass attempts

#### Performance Tests
- [ ] Database query optimization
- [ ] API response times
- [ ] Concurrent user handling
- [ ] Memory usage monitoring
- [ ] Load testing results

## 🐛 Debugging Tests

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Reset test database
dropdb vet_family_test && createdb vet_family_test
pnpm prisma migrate deploy
```

#### Authentication Mock Issues
```typescript
// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})
```

#### Prisma Client Issues
```typescript
// Use test database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
})
```

### Debug Mode
```bash
# Run with debug output
DEBUG=* pnpm test

# Run specific test file
pnpm test __tests__/api/auth-status.test.ts

# Run with verbose output
pnpm test --verbose
```

## 📈 Performance Benchmarks

### API Response Times
- **Authentication**: < 200ms
- **CRUD Operations**: < 500ms
- **Complex Queries**: < 1s
- **Report Generation**: < 5s

### Database Operations
- **Simple Queries**: < 50ms
- **Joins (< 3 tables)**: < 100ms
- **Complex Reports**: < 2s
- **Bulk Operations**: < 5s

## 🔄 Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: pnpm test:ci
```

### Pre-commit Hooks
```bash
# Install husky
pnpm add -D husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "pnpm test"
```

## 📚 Testing Best Practices

### 1. Test Structure
- **Arrange**: Set up test data and mocks
- **Act**: Execute the code being tested
- **Assert**: Verify the results

### 2. Naming Conventions
- Descriptive test names: `should create user when valid data provided`
- Group related tests in `describe` blocks
- Use `it` or `test` consistently

### 3. Mock Strategy
- Mock external dependencies (APIs, databases)
- Use real implementations for unit tests when possible
- Keep mocks simple and focused

### 4. Data Management
- Use factories for test data creation
- Clean up test data after each test
- Use transactions for database tests when possible

### 5. Error Testing
- Test both success and failure scenarios
- Verify proper error messages and status codes
- Test edge cases and boundary conditions

## 🎯 Success Criteria

A test suite is considered production-ready when:

1. **Coverage**: Minimum 80% code coverage achieved
2. **Stability**: All tests pass consistently
3. **Performance**: Test suite runs in < 5 minutes
4. **Maintenance**: Tests are easy to understand and modify
5. **Documentation**: All critical paths are documented and tested

## 📞 Support

For questions about the test suite:
1. Check this documentation
2. Review existing test files for examples
3. Contact the development team
4. Create an issue in the project repository

---

*Last updated: [Current Date]*
*Test Suite Version: 1.0.0* 