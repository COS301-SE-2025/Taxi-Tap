// import js from "@eslint/js";
// import globals from "globals";
// import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config";


// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
//   { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
//   tseslint.configs.recommended,
//   pluginReact.configs.flat.recommended,
// ]);
import js from "@eslint/js";
import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // JS files config
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      js,
    },
    extends: [
      "eslint:recommended",
      "plugin:js/recommended"
    ],
    rules: {
      // Your JS rules here
    },
  },

  // TS and JSX/TSX files config
  {
    files: ["**/*.ts", "**/*.mts", "**/*.cts", "**/*.tsx", "**/*.jsx"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json", // enable type-aware linting
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
    ],
    rules: {
      // Your TS and React-specific rules here
      // Example:
      // "@typescript-eslint/no-unused-vars": ["warn"],
      // "react/react-in-jsx-scope": "off" // if using React 17+
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]);