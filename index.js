/**
 * @file Opinionated ESLint Wrapper around: https://github.com/antfu/eslint-config
 */

import antfu, { GLOB_JS, GLOB_MARKDOWN_CODE, GLOB_SRC, GLOB_TS, renameRules } from '@antfu/eslint-config'
import e18e from '@e18e/eslint-plugin'
import eslintjs from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import jsdoc from 'eslint-plugin-jsdoc'
import { getJsdocProcessorPlugin } from 'eslint-plugin-jsdoc/getJsdocProcessorPlugin.js'
import perfectionist from 'eslint-plugin-perfectionist'
import unicorn from 'eslint-plugin-unicorn'

/**
 * @param {object} options     Configuration options passed to antfu
 * @param {...any} userConfigs Additional flat config objects
 * @returns ESLint flat config
 */
export default function config(options = {}, ...userConfigs) {
  // Enables type information to link rule names to their documentation on hover
  /** @type {Parameters<typeof import('@antfu/eslint-config').default>[0]} */
  const defaults = {
    formatters: true,
    isInEditor: false, // Keeps prefer-const auto-fixable on save (let → const)
    stylistic: {
      overrides: {
        'style/brace-style': ['warn', 'stroustrup'],
        'style/comma-dangle': ['warn', 'never'],
        'style/function-paren-newline': 'warn',
        'style/no-extra-semi': 'warn',
        'style/nonblock-statement-body-position': ['warn', 'below'],
        'style/operator-linebreak': ['warn', 'after'],
        'style/padding-line-between-statements': ['warn', { blankLine: 'never', next: 'case', prev: 'case' }],
        'style/quotes': ['warn', 'single', { allowTemplateLiterals: 'avoidEscape', avoidEscape: true }]
      }
    },
    typescript: {
      // Ignore fenced Markdown code blocks and AssemblyScript files
      ignoresTypeAware: [GLOB_MARKDOWN_CODE, '**/*.as.ts'],
      // Enable more type-checked rules and apply custom overrides
      overridesTypeAware: {
        // https://typescript-eslint.io/users/configs#recommended-configurations
        // Contains recommended + additional recommended rules that require type infos
        ...renameRules(tseslint.configs['recommended-type-checked'].rules, { '@typescript-eslint': 'ts' }),
        // Contains strict + additional strict rules require type infos
        ...renameRules(tseslint.configs['strict-type-checked'].rules, { '@typescript-eslint': 'ts' }),
        // Contains stylistic + additional stylistic rules that require type infos
        ...renameRules(tseslint.configs['stylistic-type-checked'].rules, { '@typescript-eslint': 'ts' }),
        // Adjusted recommended rules
        'ts/dot-notation': ['warn', { allowPrivateClassPropertyAccess: true, allowProtectedClassPropertyAccess: true }],
        'ts/no-confusing-void-expression': 0,
        'ts/no-empty-function': 0,
        'ts/no-explicit-any': 0,
        'ts/no-misused-spread': 0, // Should be enabled https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2521
        'ts/no-non-null-assertion': 0,
        'ts/no-unnecessary-condition': ['warn', { allowConstantLoopConditions: 'always' }],
        'ts/no-unused-vars': 0, // Handled by unused-imports/no-unused-vars
        'ts/prefer-regexp-exec': 0,
        'ts/restrict-plus-operands': 'warn', // Overrides adjustments by antfu
        'ts/restrict-template-expressions': 'warn',
        'ts/use-unknown-in-catch-callback-variable': 0,
        // Additional rules
        'ts/consistent-type-exports': 'warn',
        'ts/explicit-function-return-type': ['warn', { allowExpressions: true }],
        'ts/explicit-member-accessibility': ['warn', { accessibility: 'no-public' }],
        'ts/explicit-module-boundary-types': 'warn',
        'ts/no-dynamic-delete': 0,
        'ts/no-useless-empty-export': 'warn',
        'ts/prefer-readonly': 'warn',
        'ts/strict-boolean-expressions': ['warn', { // Catch values that are always truthy or always falsy
          allowAny: true,
          allowNullableBoolean: true,
          allowNullableEnum: false,
          allowNullableNumber: true,
          allowNullableObject: true,
          allowNullableString: true,
          allowNumber: true,
          allowString: true
        }]
      },
      tsconfigPath: 'tsconfig.json'
    }
  }

  const { rules: userRules, ...antfuOptions } = deepMerge(defaults, options)

  return antfu(antfuOptions).append({
    // Additional rules scoped to source files only
    files: [GLOB_SRC],
    rules: {
      ...e18e.configs.recommended.rules,
      ...eslintjs.configs.recommended.rules,
      ...jsdoc.configs['flat/contents-typescript'].rules,
      ...jsdoc.configs['flat/logical-typescript'].rules,
      ...jsdoc.configs['flat/requirements-typescript'].rules,
      ...jsdoc.configs['flat/stylistic-typescript'].rules,
      ...perfectionist.configs['recommended-natural'].rules,
      ...unicorn.configs.recommended.rules,

      // Complexity rules off for now but desireful to have
      // 'complexity': 'warn',
      // 'max-depth': ['warn', { max: 5 }],
      // 'max-lines': ['warn', { max: 1500, skipComments: true }],
      // 'max-nested-callbacks': ['warn', 5],
      // 'max-params': ['warn', { max: 5 }],

      // Disable/relax some rules to make it easier to write code
      'antfu/no-top-level-await': 0,
      'arrow-body-style': 'warn',
      'capitalized-comments': ['warn', 'always', { // Wrap first word in quotes disables the rule too
        ignoreConsecutiveComments: true,
        ignoreInlineComments: true,
        ignorePattern: [
          /pragma|ignore|biome-ignore|tslint:/v,
          /const |let |import |export |function |class |if \(|for \(|while \(|switch \(|console\.log\(|log\(|logDebug\(/v
        ].map(r => r.source).join('|')
      }],
      'curly': 'warn',
      'e18e/prefer-array-fill': 0, // Causes types errors
      'e18e/prefer-array-from-map': 0, // Array.from(x, fn) is slower than spread on bun
      'e18e/prefer-static-regex': 0, // Good to know, but better review and act as needed
      'guard-for-in': 'warn',
      'jsdoc/check-line-alignment': ['warn', 'always', { tags: ['param'] }],
      'jsdoc/check-param-names': ['warn', { checkDestructured: false }],
      'jsdoc/match-description': 0,
      'jsdoc/require-example': 0,
      'jsdoc/require-hyphen-before-param-description': ['warn', 'never', { tags: { '*': 'never' } }],
      'jsdoc/require-jsdoc': 0, // Making JSDoc optional
      'jsdoc/require-param': ['warn', { checkDestructured: false }],
      'logical-assignment-operators': ['warn', 'always', { enforceForIfStatements: true }],
      'no-console': 0,
      'no-else-return': ['warn', { allowElseIf: false }],
      'no-lone-blocks': 'warn',
      'no-lonely-if': 'warn',
      'no-multi-assign': 'warn',
      'no-shadow': 'warn',
      'no-unused-vars': 0, // Handled by unused-imports/no-unused-vars
      'no-void': ['warn', { allowAsStatement: true }],
      'node/prefer-global/buffer': 0,
      'node/prefer-global/process': 0,
      'object-shorthand': ['warn', 'always', { avoidExplicitReturnArrows: true }],
      'operator-assignment': ['warn', 'always'],
      'perfectionist/sort-classes': ['warn', { // Relocate 'static-method' before 'static-block' without hardcoding group members
        groups: perfectionist.rules['sort-classes'].defaultOptions[0].groups
          .filter(group => !(Array.isArray(group) && group.includes('static-method')))
          .flatMap(group => group === 'static-block' ? [['static-method', 'static-function-property'], group] : [group]),
        order: 'asc',
        type: 'natural'
      }],
      'perfectionist/sort-interfaces': ['warn', {
        order: 'asc',
        partitionByComment: { block: false, line: true }, // Ignore JSDOC block comments
        type: 'natural'
      }],
      'perfectionist/sort-objects': ['warn', {
        order: 'asc',
        partitionByComment: { block: false, line: true }, // Ignore JSDOC block comments
        type: 'natural'
      }],
      'prefer-object-has-own': 'warn',
      'regexp/no-unused-capturing-group': ['warn', { allowNamed: true, fixable: false }],
      'unicorn/consistent-function-scoping': ['warn', { checkArrowFunctions: false }],
      'unicorn/filename-case': ['warn', {
        cases: { camelCase: true, kebabCase: true, pascalCase: true, snakeCase: true },
        ignore: ['README.md', 'CONTRIBUTING.md', 'CHANGELOG.md']
      }],
      'unicorn/no-array-reduce': 0,
      'unicorn/no-array-reverse': 0, // Little benefit, find it cumbersome to deal with
      'unicorn/no-array-sort': 0,
      'unicorn/no-new-array': 0, // See: https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2406
      'unicorn/no-null': 0,
      'unicorn/no-process-exit': 0,
      'unicorn/prevent-abbreviations': ['warn', { checkFilenames: false }]
    }
  }, {
    // TypeScript's own compiler handles those cases; see https://typescript-eslint.io/troubleshooting/faqs/eslint
    files: [GLOB_TS, GLOB_MARKDOWN_CODE],
    rules: { 'no-redeclare': 0, 'no-undef': 0 }
  }, {
    files: [GLOB_JS],
    rules: { 'jsdoc/no-types': 0, 'jsdoc/require-param-type': 1 }
  }, {
    files: [`src/${GLOB_SRC}`],
    ignores: [GLOB_MARKDOWN_CODE, '**/*.{d,as,test}.{js,ts}'],
    rules: { 'jsdoc/require-jsdoc': ['warn', { require: { FunctionDeclaration: true, MethodDefinition: true } }] }
  }, {
    files: [GLOB_SRC],
    ignores: [GLOB_MARKDOWN_CODE, '**/*.{d,as,test}.{js,ts}'],
    rules: { 'jsdoc/require-file-overview': 1 }
  }, {
    // Lint @example tags
    files: [GLOB_TS],
    // The regex is needed to extract the code to be linted from the @example tag.
    plugins: { name: getJsdocProcessorPlugin({ exampleCodeRegex: /```[jt]s\n([\s\S]*?)```/g, matchingFileName: 'name.md/*.ts', parser }) },
    processor: 'name/examples'
    // Let user options.rules override any of the ones above
  }, {
    rules: userRules ?? {}
  }, ...userConfigs).disableRulesFix(['unused-imports/no-unused-imports'])
}

function deepMerge(target, override) {
  const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v)
  const result = { ...target }
  for (const key of Object.keys(override)) {
    const value = override[key]
    if (value === undefined) {
      continue
    }
    result[key] = isObject(value) && isObject(result[key]) ? deepMerge(result[key], value) : value
  }
  return result
}
