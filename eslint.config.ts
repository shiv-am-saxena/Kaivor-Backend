import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import jest from "eslint-plugin-jest";
import globals from "globals";

export default defineConfig([
	{
		files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
		plugins: { js, tseslint, jest },
		extends: ["js/recommended", "tseslint/recommended"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tseslint.parser,
			parserOptions: {
				project: "./tsconfig.json"
			},
			globals: {
				...globals.jest
			},
		},
		rules: {
			"no-console": ["error", { allow: ["warn", "error"] }],
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			eqeqeq: ["error", "always"],
			curly: ["error", "all"],
			"max-depth": ["error", { max: 4 }],
			"max-lines": ["warn", { max: 300, skipBlankLines: true, skipComments: true }],
			"no-unreachable": "error",
			"no-duplicate-imports": "error",
			"no-var": "error",
			"func-style": [
				"error",
				"expression",
				{
					allowArrowFunctions: true
				}
			],
			"prefer-arrow-callback": "error",
			"prefer-const": ["warn", { destructuring: "all" }],
			"@typescript-eslint/explicit-function-return-type": [
				"error",
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true
				}
			],
			"@typescript-eslint/no-explicit-any": "off",
			"object-shorthand": ["error", "always"],
			"prefer-template": "error",
			"prefer-destructuring": "warn",
			"no-shadow": "error",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
			"@typescript-eslint/await-thenable": "error",
			"@typescript-eslint/require-await": "error"
		},
		ignores: ["node_modules/**"]
	}
]);
