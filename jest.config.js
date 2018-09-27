module.exports = {
  clearMocks: true,
  collectCoverage: true,
  // collectCoverageFrom: [''],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  testPathIgnorePatterns: ['/node_modules/']
};
