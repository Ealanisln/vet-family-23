const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
    '!src/app/layout.tsx',
    '!src/app/not-found.tsx',
    '!src/app/robots.ts',
    '!src/app/sitemap.ts',
    '!src/app/studio/**',
    '!src/sanity/**',
    '!src/components/ui/**',
    '!src/types/**',
    '!src/lib/fpixel.js',
    '!**/*.config.{js,ts}',
    '!**/node_modules/**',
    // Exclude page components (mostly just JSX wrappers)
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
    // Exclude static data files
    '!src/**/*.data.{ts,tsx}',
    '!src/**/photos.ts',
    '!src/**/data.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 15,
      lines: 15,
      statements: 15
    }
  },
  clearMocks: true,
  restoreMocks: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 10000,
}

module.exports = createJestConfig(customJestConfig) 