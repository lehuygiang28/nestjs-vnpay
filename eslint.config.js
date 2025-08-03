const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
                sourceType: 'module',
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
            prettier: prettier,
        },
        rules: {
            ...typescript.configs.recommended.rules,
            ...prettierConfig.rules,
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-empty-function': 'warn',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            'prettier/prettier': 'error',
        },
    },
    {
        files: ['tests/**/*.ts'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
            },
        },
    },
    {
        ignores: ['lib/**/*', 'dist/**/*', 'coverage/**/*', 'node_modules/**/*'],
    },
];
