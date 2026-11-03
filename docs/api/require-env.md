# requireEnv()

Read a variable the app cannot run without. Returns a `string` or throws with the variable's name.

## Import

```ts
import { requireEnv } from 'next-dynenv'
```

## Signature

```ts
function requireEnv(key: string): string
```

## Parameters

| Parameter | Type     | Description                                                      |
| --------- | -------- | ---------------------------------------------------------------- |
| `key`     | `string` | Variable name. In the browser it must start with `NEXT_PUBLIC_`. |

## Returns

The value, typed `string`. `requireEnv()` reads through [`env()`](/api/env), so it follows the same server and browser
rules.

## Throws

When the value is `undefined`:

```text
Required environment variable 'DATABASE_URL' is not defined.
Please set it in your environment or .env file.
```

In the browser, once `window.__ENV` exists, a key without the `NEXT_PUBLIC_` prefix throws the
[`env()` prefix error](/api/env#throws) first.

## Behavior

| Variable                  | Result            |
| ------------------------- | ----------------- |
| `https://api.example.com` | Returns the value |
| Set to an empty string    | Returns `''`      |
| Not set                   | Throws            |

Only `undefined` fails. Validate content with [`envParsers.url()`](/api/parsers#url) or
[`envParsers.enum()`](/api/parsers#enum) when an empty or malformed value would also break the app.

## Examples

### Route handler

```ts
// app/api/orders/route.ts
import { requireEnv } from 'next-dynenv'

export async function GET() {
    const res = await fetch(`${requireEnv('NEXT_PUBLIC_API_URL')}/orders`, {
        headers: { Authorization: `Bearer ${requireEnv('API_SECRET_KEY')}` },
    })

    return Response.json(await res.json())
}
```

### Config function

```ts
// lib/config.ts
import { requireEnv } from 'next-dynenv'

export function getConfig() {
    return {
        apiUrl: requireEnv('NEXT_PUBLIC_API_URL'),
        appName: requireEnv('NEXT_PUBLIC_APP_NAME'),
    }
}
```

::: warning Call it inside functions

Keep `requireEnv()` out of module scope. `next build` imports your route modules, so a top-level call throws during the
build on any machine that lacks production variables, and building without them is how one image serves every
environment.

:::

### Client component

```tsx
'use client'

import { requireEnv } from 'next-dynenv'

export function SupportLink() {
    const appName = requireEnv('NEXT_PUBLIC_APP_NAME')

    return <a href="/support">Contact {appName} support</a>
}
```

## Compared with env()

|               | `env()`                     | `requireEnv()`    |
| ------------- | --------------------------- | ----------------- |
| Return type   | `string \| undefined`       | `string`          |
| Missing value | `undefined` or your default | Throws            |
| Default value | Optional second argument    | None              |
| Use it for    | Optional settings           | Required settings |

For typed values, the [`json()`](/api/parsers#json), [`url()`](/api/parsers#url), and [`enum()`](/api/parsers#enum)
parsers also throw on missing values unless you pass a default. [`boolean()`](/api/parsers#boolean),
[`number()`](/api/parsers#number), and [`array()`](/api/parsers#array) fall back to defaults instead.

## Related

- [`env()`](/api/env) for optional values
- [`envParsers`](/api/parsers) for typed values
- [Troubleshooting](/guide/troubleshooting) for variables that come back undefined
