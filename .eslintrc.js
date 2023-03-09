module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest-dom/recommended",
    "plugin:react-hooks/recommended",
    "airbnb",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "jest-dom"],
  settings: {
    react: {
      version: "17.0.2",
    },
    "import/internal-regex": "^~/.+",
  },
  rules: {
    "import/prefer-default-export": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        alphabetize: { order: "asc" },
        "newlines-between": "always",
      },
    ],
    camelcase: "off",
    "no-use-before-define": "off",
    "no-plusplus": "off",
    "jsx-a11y/label-has-associated-control": ["error", { assert: "either" }],
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
    "react/jsx-props-no-spreading": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.{ts,tsx}",
          "**/test/**/*.{ts,tsx}",
          "**/*.stories.{ts,tsx}",
          "**/migrate-db/**/*.{ts,tsx}",
          "**/setupTests.ts",
          "**/hardhat.config.ts",
          "**/rollup.config.js",
        ],
      },
    ],
    // Prisma uses underscored names for aggregation
    "no-underscore-dangle": "off",
    // Don't require object destructuring
    "prefer-destructuring": [
      "error",
      {
        array: true,
        object: false,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    // Make this an error instead of a warning.
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks:
          "(useWatchRecord|useWatchCollection|useWatchCollectionDictionary|useWatchCollectionKeyed)",
      },
    ],
    // Allow apostrophes.
    "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
    "no-else-return": "off",

    // Override for UniversalLink
    "jsx-a11y/anchor-is-valid": "off",

    "react/function-component-definition": "off",

    "@typescript-eslint/no-empty-interface": [
      "error",
      { allowSingleExtends: true },
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
    "react/prop-types": "off",
    "react/jsx-filename-extension": [1, { extensions: [".ts", ".tsx"] }],
    "react/require-default-props": 0,
    "no-useless-constructor": "off",
    "no-empty-function": "off",
    "no-undef": "off",
    "no-redeclare": "off",
    "no-shadow": "off",
    "no-dupe-class-members": "off",
  },
};
