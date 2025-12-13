# Base TypeScript Config

A single, opinionated setup for my TypeScript projects

- Opinionated ESLint Config based on [@antfu/eslint-config](https://github.com/antfu/eslint-config)
- Opinionated [tsconfig.json](tsconfig.json)

## Usage

```bash
bun add github:LangLangBart/base-ts-config
```

> [!NOTE]
> This package is installed from GitHub, not the npm registry.
>
> [GitHub URLs | npm Docs](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#github-urls)

package.json

```json
{
  "dependencies": {
    "base-ts-config": "github:LangLangBart/base-ts-config"
  }
}
```

eslint.config.js

```js
import config from 'base-ts-config'

export default config({
  // optional project-specific overrides
  ignores: ['some/extra/path/']
})
```

tsconfig.json

```json
{
  "extends": "base-ts-config/tsconfig.json"
}
```
