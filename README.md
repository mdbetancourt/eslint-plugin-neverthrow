# eslint-plugin-neverthrow

[![npm version](https://img.shields.io/npm/v/eslint-plugin-neverthrow.svg)](https://www.npmjs.com/package/eslint-plugin-neverthrow)
[![Downloads/month](https://img.shields.io/npm/dm/eslint-plugin-neverthrow.svg)](http://www.npmtrends.com/eslint-plugin-neverthrow)

## Installation

Use [npm](https://www.npmjs.com/) or a compatibility tool to install.

```bash
npm install --save-dev eslint eslint-plugin-neverthrow @typescript-eslint/parser
```

### Requirements

- Node.js v8.10.0 or newer versions.
- ESLint v5.16.0 or newer versions.
- @typescript-eslint/parser

## Usage

Write your config file such as `.eslintrc.js`.

```js
module.exports = {
  plugins: ['neverthrow'],
  rules: {
    'neverthrow/must-use-result': 'error',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
```

See also [Configuring ESLint](https://eslint.org/docs/user-guide/configuring).

## Configs

- `neverthrow/recommended` ... enables the recommended rules.

## Rules

<!--RULE_TABLE_BEGIN-->

### Possible Errors

| Rule ID                                                       | Description                                                                                |     |
| :------------------------------------------------------------ | :----------------------------------------------------------------------------------------- | :-: |
| [neverthrow/must-use-result](./docs/rules/must-use-result.md) | Not handling neverthrow result is a possible error because errors could remain unhandleds. | ⭐️ |

<!--RULE_TABLE_END-->

## Semantic Versioning Policy

This plugin follows [Semantic Versioning](http://semver.org/) and [ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

## Changelog

- [GitHub Releases](https://github.com/mdbetancourt/eslint-plugin-neverthrow/releases)

## Contributing

Welcome your contribution!

See also [ESLint Contribution Guide](https://eslint.org/docs/developer-guide/contributing/).

### Development Tools

- `npm test` runs tests.
- `npm run update` updates the package version. And it updates `src/configs/recommended.ts`, `lib/index.ts`, and `README.md`'s rule table. See also [npm version CLI command](https://docs.npmjs.com/cli/version).
- `npm run add-rule <RULE_ID>` creates three files to add a new rule.

**forked from [mysticatea/template-eslint-plugin](https://github.com/mysticatea/template-eslint-plugin)**
