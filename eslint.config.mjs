import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unescaped quotes in JSX for better readability
      'react/no-unescaped-entities': 'warn',
      // Allow any type in specific cases
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused variables in development
      '@typescript-eslint/no-unused-vars': 'warn',
      // More lenient exhaustive deps rule
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
