// platform/jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Only look for tests in platform/tests/unit/backend
  roots: ['<rootDir>/tests/unit/backend'],

  // Only match .test.ts files
  testMatch: ['**/*.test.tsx'],

  // Transform TS → JS with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  moduleFileExtensions: ['ts','tsx','js','json','node'],

  // NO setupFilesAfterEnv here
};
