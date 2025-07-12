module.exports = {
  preset: 'jest-puppeteer',
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)', 
    './__tests__/cookie-removal.test.js' 
  ],
  testPathIgnorePatterns: ['/node_modules/']
};