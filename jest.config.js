module.exports = {
  clearMocks: true,
  collectCoverage: true,
  // collectCoverageFrom: [''],
  // setupFiles: ['./tests/helpers/setupJestEnv.js'],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.js?(x)', '**/tests/**/?(*.)+(spec|test).js?(x)'],
  testPathIgnorePatterns: ['/node_modules/']
};
