/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Only look for tests in tests/unit/frontend (matching backend pattern)
  roots: ['<rootDir>/tests/unit/frontend'],
  
  // Only match .test.ts/.test.tsx files (matching backend pattern)
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  transformIgnorePatterns: ['/node_modules/']
};