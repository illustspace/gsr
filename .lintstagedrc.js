module.exports = {
  "*.{ts,tsx}": ["yarn prettier --write", "yarn eslint --fix --max-warnings 0"],
  "*.{js,html,css,md,json,yml}": "yarn prettier --write",
  "*.sol": [
    "prettier --write",
    "yarn ws contracts solhint --ignore-path .solhintignore --fix",
  ],
};
