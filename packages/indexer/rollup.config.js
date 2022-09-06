import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";

const watch = process.env.ROLLUP_WATCH === "true";

export default defineConfig({
  input: "src/index.ts",
  output: [{ file: "build/index.js", format: "cjs", sourcemap: watch }],
  external: ["@prisma/client"],
  plugins: [
    commonjs({
      strictRequires: true,
    }),
    resolve({
      preferBuiltins: false,
    }),
    json(),
    typescript({ sourceMap: watch }),
    // Start a node server when in watch mode
    watch &&
      run({
        execArgv: ["-r", "source-map-support/register"],
      }),

    copy({
      targets: [
        {
          src: ["../../node_modules/.prisma/client"],
          dest: "build/node_modules/.prisma",
        },
        {
          src: ["../../node_modules/@prisma/client"],
          dest: "build/node_modules/@prisma",
        },
      ],
    }),
  ],
});
