module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true
  },

  extends: 'eslint:recommended',

  parserOptions: {
    ecmaVersion: 2018
  },

  overrides: [
    {
      files: ['test/**/*.test.js'],
      env: {
        mocha: true
      },
      globals: {
        expect: true,
        sinon: true
      }
    }
  ],

  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never']
  }
}
