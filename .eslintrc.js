module.exports = {
  env: {
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};
