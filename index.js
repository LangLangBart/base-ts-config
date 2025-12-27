/**
 * @file Opinionated ESLint Wrapper around  https://github.com/antfu/eslint-config
 */

import antfu from '@antfu/eslint-config'
import parser from '@typescript-eslint/parser'
import jsdoc from 'eslint-plugin-jsdoc'
import { getJsdocProcessorPlugin } from 'eslint-plugin-jsdoc/getJsdocProcessorPlugin.js'
import perfectionist from 'eslint-plugin-perfectionist'
import sonarjs from 'eslint-plugin-sonarjs'
import unicorn from 'eslint-plugin-unicorn'
import merge from 'lodash.merge'

/**
 * @param {object} options     Configuration options passed to antfu
 * @param {...any} userConfigs Additional flat config objects
 * @returns ESLint flat config
 */
export default function config(options = {}, ...userConfigs) {
  /** @type {Parameters<typeof import('@antfu/eslint-config').default>[0]} */
  const defaults = {
    formatters: true,
    isInEditor: false,
    plugins: { sonarjs },
    rules: {
      // Disable/relax some rules to make it easier to write code
      'antfu/no-top-level-await': 0,
      'curly': 1,
      'jsdoc/check-line-alignment': ['warn', 'always', { tags: ['param'] }],
      'jsdoc/check-param-names': ['warn', { checkDestructured: false }],
      'jsdoc/match-description': 0,
      'jsdoc/require-example': 0,
      'jsdoc/require-hyphen-before-param-description': ['warn', 'never', { tags: { '*': 'never' } }],
      'jsdoc/require-jsdoc': 0, // Making JSDoc optional
      'jsdoc/require-param': ['warn', { checkDestructured: false }],
      'no-console': 0,
      'node/prefer-global/buffer': 0,
      'node/prefer-global/process': 0,
      'perfectionist/sort-modules': ['warn', {
        groups: [
          'declare-enum',
          'export-enum',
          'enum',
          'declare-interface',
          'export-interface',
          'interface',
          'declare-type',
          'export-type',
          'type',
          'declare-class',
          'class',
          'export-class',
          'declare-function',
          'export-function',
          'function'
        ],
        order: 'asc',
        type: 'natural'
      }],
      'prefer-object-has-own': 1,
      'regexp/no-unused-capturing-group': ['warn', { allowNamed: true, fixable: false }],
      'sonarjs/class-name': 'warn',
      // Complexity rules off for  now but desireful to have
      // 'sonarjs/cognitive-complexity': 0,
      // 'sonarjs/cyclomatic-complexity': 0,
      // 'sonarjs/expression-complexity': 0,
      'sonarjs/no-all-duplicated-branches': 'warn',
      'sonarjs/no-array-delete': 'warn',
      'sonarjs/no-associative-arrays': 'warn',
      'sonarjs/no-async-constructor': 'warn',
      'sonarjs/no-collection-size-mischeck': 'warn',
      'sonarjs/no-duplicated-branches': 'warn',
      'sonarjs/no-element-overwrite': 'warn',
      'sonarjs/no-empty-collection': 'warn',
      'sonarjs/no-identical-conditions': 'warn',
      'sonarjs/no-identical-expressions': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-in-misuse': 'warn',
      'sonarjs/no-invariant-returns': 'warn',
      'sonarjs/no-inverted-boolean-check': 'warn',
      'sonarjs/no-redundant-assignments': 'warn',
      'sonarjs/no-small-switch': 'warn',
      'sonarjs/no-try-promise': 'warn',
      'sonarjs/no-use-of-empty-return-value': 'warn',
      'sonarjs/no-useless-increment': 'warn',
      'sonarjs/non-existent-operator': 'warn',
      'sonarjs/prefer-promise-shorthand': 'warn',
      'sonarjs/prefer-while': 'warn',
      'sonarjs/strings-comparison': 'warn',
      'sonarjs/super-invocation': 'warn',
      'unicorn/consistent-function-scoping': ['warn', { checkArrowFunctions: false }],
      'unicorn/filename-case': ['warn', { cases: { kebabCase: true, pascalCase: true, snakeCase: true } }],
      'unicorn/no-array-reduce': 0,
      'unicorn/no-null': 0,
      'unicorn/no-process-exit': 0,
      'unicorn/prevent-abbreviations': ['warn', { checkFilenames: false }]
    },
    stylistic: {
      overrides: {
        'style/brace-style': ['warn', 'stroustrup'],
        'style/comma-dangle': ['warn', 'never'],
        'style/function-paren-newline': 'warn',
        'style/no-extra-semi': 'warn',
        'style/nonblock-statement-body-position': ['warn', 'below'],
        'style/operator-linebreak': ['warn', 'after'],
        'style/padding-line-between-statements': ['warn', { blankLine: 'never', next: 'case', prev: 'case' }]
      }
    },
    typescript: {
    // Ignore fenced Markdown code blocks and AssemblyScript files
      ignoresTypeAware: ['**/*.md/*.ts', '**/*.as.ts'],
      // Disable/relax some type-aware rules that are too strict
      overridesTypeAware: {
        'ts/dot-notation': ['warn', { allowPrivateClassPropertyAccess: true, allowProtectedClassPropertyAccess: true }],
        'ts/explicit-function-return-type': ['warn', { allowExpressions: true }],
        'ts/explicit-module-boundary-types': 'warn',
        'ts/no-deprecated': 'warn', // Catches deprecated API usage
        'ts/require-await': 'warn', // Check functions actually need to be async
        'ts/strict-boolean-expressions': 0
      },
      tsconfigPath: 'tsconfig.json'
    }
  }

  const { rules, ...environment } = merge(defaults, options)

  return antfu(
    environment, // First to configure the environment (TypeScript, Stylistic, etc.)
    { rules: jsdoc.configs['flat/contents-typescript'].rules },
    { rules: jsdoc.configs['flat/logical-typescript'].rules },
    { rules: jsdoc.configs['flat/requirements-typescript'].rules },
    { rules: jsdoc.configs['flat/stylistic-typescript'].rules },
    { rules: perfectionist.configs['recommended-natural'].rules },
    { rules: unicorn.configs.recommended.rules },
    { rules }, // Repeated to override the presets above
    {
      files: ['**/*.js'],
      rules: { 'jsdoc/no-types': 0, 'jsdoc/require-param-type': 1 }
    },
    {
      files: ['src/**/*.{js,ts}'],
      rules: { 'jsdoc/require-jsdoc': ['warn', { require: { FunctionDeclaration: true, MethodDefinition: true } }] }
    },
    {
      files: ['**/*.{js,ts}'],
      ignores: ['**/*.md/*.{js,ts}', '**/*.{d,as,test}.{js,ts}'],
      rules: { 'jsdoc/require-file-overview': 1 }
    },
    {
      // Lint @example tags
      files: ['**/*.ts'],
      // The regex is needed to extract the code to be linted from the @example tag.
      plugins: { name: getJsdocProcessorPlugin({ exampleCodeRegex: /```[jt]s\n([\s\S]*?)```/g, matchingFileName: 'name.md/*.ts', parser }) },
      processor: 'name/examples'
    },
    ...userConfigs
  )
}
