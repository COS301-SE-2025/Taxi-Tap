/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/components','<rootDir>/app'],
  testMatch: ['**/?(*.)+(spec|test).[jt]sx?'],
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  transformIgnorePatterns: ['/node_modules/']
};
