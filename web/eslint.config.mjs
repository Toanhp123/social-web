import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/views/*",
                "@/widgets/*",
                "@/features/*",
                "@/entities/*",
              ],
              message: "shared must not depend on upper FSD layers.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/entities/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/views/*", "@/widgets/*", "@/features/*"],
              message: "entities must not depend on upper FSD layers.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/views/*", "@/widgets/*"],
              message: "features must not depend on upper FSD layers.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/widgets/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/views/*"],
              message: "widgets must not depend on upper FSD layers.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/views/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*"],
              message: "views must not depend on the app layer.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/views/*/*",
                "@/widgets/*/*",
                "@/features/*/api/*",
                "@/features/*/model/*",
                "@/features/*/server/*",
                "@/features/*/ui/*",
                "@/entities/*/api/*",
                "@/entities/*/lib/*",
                "@/entities/*/model/*",
                "@/entities/*/server/*",
                "@/entities/*/ui/*",
              ],
              message: "routes should import slices through public APIs.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
