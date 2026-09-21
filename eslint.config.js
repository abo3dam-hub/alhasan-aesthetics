import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config(
  { ignores: ["dist", "src/convex/_generated/**"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Dev-only fast-refresh (HMR) hint. The codebase intentionally mixes
      // components with hooks/constants/variants in a single file (shadcn
      // ui/*, i18n provider+hook, procedureIcons registry, dev toolbar), so
      // this rule only produces noise. It has zero effect on production.
      "react-refresh/only-export-components": "off",
    },
  },
);
