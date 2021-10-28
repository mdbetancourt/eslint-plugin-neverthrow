# neverthrow/must-use-result
> Not handling neverthrow result is a possible error because errors could remain unhandleds.
> - ⭐️ This rule is included in `plugin:neverthrow/recommended` preset.

> An example rule.
>
> - ⭐️ This rule is included in `plugin:xxxx/recommended` preset.

This is an example.

## Rule Details

This rule aimed at disallowing `example` identifiers.

Examples of **incorrect** code:

```js
/*eslint template/example-rule: error */

var example = 1;
```

Examples of **correct** code:

```js
/*eslint template/example-rule: error */

var foo = 1;
```

## Options

Nothing.

## Implementation

- [Rule source](../../src/rules/must-use-result.ts)
- [Test source](../../tests/rules/must-use-result.ts)
