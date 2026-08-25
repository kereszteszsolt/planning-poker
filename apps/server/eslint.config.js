import { typescriptBaseConfig } from "@planning-poker/config/eslint/base";
import globals from "globals";

export default [
  ...typescriptBaseConfig,
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  { ignores: ["dist/**"] },
];
