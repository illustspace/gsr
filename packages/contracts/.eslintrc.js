module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:@typescript-eslint/recommended", "airbnb-base", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "import/prefer-default-export": "off",
    camelcase: "off",
    "no-use-before-define": "off",
    "no-plusplus": "off",
    "no-console": ["error", { allow: ["error", "trace"] }],
    "class-methods-use-this": "off",
    "arrow-body-style": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: false,
        argsIgnorePattern: "^rest|^_",
      },
    ],
    "lines-between-class-members": [
      "error",
      "always",
      { exceptAfterSingleLine: true },
    ],
    "@typescript-eslint/no-empty-function": "off",
    "import/no-extraneous-dependencies": [
      "error",
      { devDependencies: ["**/*.test.{ts,tsx}", "**/test/**/*.ts"] },
    ],

    // TODO: Remove these
    "spaced-comment": "off",
    "no-alert": "off",
    "no-restricted-syntax": "off",
    "guard-for-in": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    // Rely on typescript for these:
    "no-unused-vars": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "no-useless-constructor": "off",
    "no-empty-function": "off",
    "no-undef": "off",
  },
};
