# Base TypeScript Config

- Opinionated ESLint Config based on [@antfu/eslint-config](https://github.com/antfu/eslint-config)
- Opinionated [tsconfig.json](tsconfig.json)

## Usage

```bash
# https://docs.npmjs.com/cli/v10/configuring-npm/package-json#github-urls
bun add --dev github:LangLangBart/base-ts-config
```

package.json

```json
{
  "devDependencies": {
    "base-ts-config": "github:LangLangBart/base-ts-config"
  }
}
```

eslint.config.ts

```js
import config from 'base-ts-config'

export default config({
  // Optional project-specific overrides
  ignores: ['some/extra/path/']
})
```

tsconfig.json

```json
{
  "extends": "base-ts-config/tsconfig.json"
}
```
