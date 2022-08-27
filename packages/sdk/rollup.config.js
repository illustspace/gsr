import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { dependencies, peerDependencies } from "./package.json";

const dependencyKeys = Object.keys(dependencies);
const peerDependencyKeys = Object.keys(peerDependencies);

export default defineConfig({
  input: "src/gsr.ts",
  output: [
    { file: "dist/gsr.cjs.js", format: "cjs", sourcemap: true },
    { file: "dist/gsr.esm.js", format: "esm", sourcemap: true },
  ],
  external: (id) => {
    if (/lodash/.test(id)) return true;
    if (dependencyKeys.includes(id)) return true;
    if (peerDependencyKeys.includes(id)) return true;
    return false;
  },
  plugins: [commonjs(), json(), typescript()],
});
