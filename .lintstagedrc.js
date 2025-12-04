module.exports = {
  // JavaScript and JSX files
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // JSON files
  '*.json': [
    'prettier --write',
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write',
  ],
  
  // Test files - run tests for changed files
  '**/__tests__/**/*.{js,jsx}': [
    'jest --bail --findRelatedTests',
  ],
};
