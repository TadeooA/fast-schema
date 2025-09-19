// Jest configuration for fast-schema tests
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    '../**/*.ts',
    '!../**/*.d.ts',
    '!../tests/**/*.ts',
    '!../test-*.ts'
  ],
  coverageDirectory: './coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  testTimeout: 30000, // 30 seconds for WASM tests
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          lib: ['ES2020', 'DOM'],
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      }
    }
  },
  // Custom test environment for WASM
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  // Performance monitoring
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-report',
      filename: 'report.html',
      expand: true
    }]
  ]
};