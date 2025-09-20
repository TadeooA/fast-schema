/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test files
  testMatch: [
    '<rootDir>/src/tests/**/*.test.ts',
    '<rootDir>/src/**/__tests__/**/*.test.ts'
  ],

  // Coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // TypeScript configuration
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2020',
        module: 'CommonJS',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitOverride: false,
      },
    }],
  },

  // Module resolution
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '../pkg': '<rootDir>/src/tests/__mocks__/wasm-mock.ts',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/test-setup.ts'],

  // Performance
  maxWorkers: '50%',

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/pkg/',
  ],

};