/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/*.js',
    '<rootDir>/build',
    '<rootDir>/examples',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/*.js',
    '<rootDir>/build',
    '<rootDir>/examples',
    '<rootDir>/src/lib',
    '<rootDir>/src/test-setup.ts',
  ],
};
