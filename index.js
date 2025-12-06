/**
 * @file Opinionated ESLint Wrapper around  https://github.com/antfu/eslint-config
 */

import antfu from '@antfu/eslint-config'
import parser from '@typescript-eslint/parser'
import jsdoc from 'eslint-plugin-jsdoc'
import { getJsdocProcessorPlugin } from 'eslint-plugin-jsdoc/getJsdocProcessorPlugin.js'
import perfectionist from 'eslint-plugin-perfectionist'
import unicorn from 'eslint-plugin-unicorn'
import merge from 'lodash.merge'

/**
 * @param {object} options     Configuration options passed to antfu
 * @param {...any} userConfigs Additional flat config objects
 * @returns ESLint flat config
 */
export default function config(options = {}, ...userConfigs) {
  const defaults = {
    formatters: true,
    isInEditor: false,
    rules: {
      ...jsdoc.configs['flat/contents-typescript'].rules,
      ...jsdoc.configs['flat/logical-typescript'].rules,
      ...jsdoc.configs['flat/requirements-typescript'].rules,
      ...jsdoc.configs['flat/stylistic-typescript'].rules,
      ...perfectionist.configs['recommended-natural'].rules,
      ...unicorn.configs.recommended.rules,
      // Disable/relax some rules to make it easier to write code
      'antfu/no-top-level-await': 0,
      'curly': 1,
      'jsdoc/check-line-alignment': ['warn', 'always', { tags: ['param'] }],
      'jsdoc/match-description': 0,
      'jsdoc/require-example': 0,
      'jsdoc/require-hyphen-before-param-description': ['warn', 'never', { tags: { '*': 'never' } }],
      'jsdoc/require-jsdoc': 0, // Making JSDoc optional
      'no-console': 0,
      'node/prefer-global/buffer': 0,
      'node/prefer-global/process': 0,
      'prefer-object-has-own': 1,
      'regexp/no-unused-capturing-group': ['warn', { allowNamed: true, fixable: false }],
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
        'ts/strict-boolean-expressions': 0
      },
      tsconfigPath: 'tsconfig.json'
    }
  }

  return antfu(merge(defaults, options), {
    files: ['**/*.js'],
    rules: { 'jsdoc/no-types': 0, 'jsdoc/require-param-type': 1 }
  }, {
    files: ['src/**/*.{js,ts}'],
    rules: { 'jsdoc/require-jsdoc': ['warn', { require: { FunctionDeclaration: true, MethodDefinition: true } }] }
  }, {
    files: ['**/*.{js,ts}'],
    ignores: ['**/*.md/*.{js,ts}', '**/*.{d,as,test}.{js,ts}'],
    rules: { 'jsdoc/require-file-overview': 1 }
  }, {
  // Lint @example tags
    files: ['**/*.ts'],
    // The regex is needed to extract the code to be linted from the @example tag.
    plugins: { name: getJsdocProcessorPlugin({ exampleCodeRegex: /```[jt]s\n([\s\S]*?)```/g, matchingFileName: 'name.md/*.ts', parser }) },
    processor: 'name/examples'
  }, ...userConfigs)
}
