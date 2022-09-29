// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    "import/order": [
      "error",
      { groups: [["builtin", "external", "internal"]] },
    ],
    "@next/next/no-html-link-for-pages": [
      "error",
      path.resolve(__dirname, "pages"),
    ],
    "react/no-unknown-property": "off",
  },
};
