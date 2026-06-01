import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // 1. Specify which files ESLint should check
  { 
    files: ["src/**/*.ts"] 
  },
  
  // 2. Define global environment contexts
  { 
    languageOptions: { 
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    } 
  },

  // 3. Load recommended rule profiles
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // 4. Custom strict rules optimized for Express + Prisma
  {
    rules: {
      "no-console": "warn",                       // Flags leftover console.logs
      "no-unused-vars": "off",                    // Handled better by the TypeScript compiler rule below
      "@typescript-eslint/no-unused-vars": [
        "error", 
        { "argsIgnorePattern": "^_" }             // Allows unused Express arguments like `_next`
      ],
      "@typescript-eslint/no-explicit-any": "error", // Enforces strict type-safety across endpoints
      "@typescript-eslint/consistent-type-imports": "error" // Enforces type visibility compliance
    }
  },

  // 5. CRITICAL: Inject Prettier config LAST to turn off conflicting styling rules
  eslintConfigPrettier,

  // 6. Define global file execution bypass targets
  {
    ignores: [
      "dist/", 
      "node_modules/", 
      "prisma/migrations/"
    ]
  }
];
