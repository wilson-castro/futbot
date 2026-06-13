import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Os módulos do projeto importam com extensão `.ts` explícita (ESM).
  // Em ambiente de teste (CommonJS) removemos a extensão para o resolver do Jest.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.ts$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        // Transpila sem type-check para suportar `allowImportingTsExtensions`
        // e os import attributes de JSON sem conflito de configuração.
        tsconfig: {
          module: 'commonjs',
          isolatedModules: true,
          verbatimModuleSyntax: false,
          esModuleInterop: true,
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          ignoreDeprecations: '6.0',
        },
      },
    ],
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 15000,
};

export default config;
