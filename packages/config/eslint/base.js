import js from "@eslint/js";
import tseslint from "typescript-eslint";

export const typescriptBaseConfig = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
    },
  },
);
