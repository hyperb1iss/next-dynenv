# envParsers

Turn environment strings into booleans, numbers, lists, JSON, URLs, and enums, with error messages that name the
variable.

## Import

```ts
import { envParsers } from 'next-dynenv'
```

## At a glance

| Parser                                      | Returns    | Not set              | Invalid       |
| ------------------------------------------- | ---------- | -------------------- | ------------- |
| [`boolean(key, default = false)`](#boolean) | `boolean`  | `default`            | `default`     |
| [`number(key, default = 0)`](#number)       | `number`   | `default`            | Throws        |
| [`array(key, default = [])`](#array)        | `string[]` | `default`            | Never invalid |
| [`json<T>(key, default?)`](#json)           | `T`        | `default`, or throws | Throws        |
| [`url(key, default?)`](#url)                | `string`   | `default`, or throws | Throws        |
| [`enum<T>(key, allowed, default?)`](#enum)  | `T`        | `default`, or throws | Throws        |

"Not set" means `undefined`. Empty strings differ per parser: `boolean` and `number` treat blank values as not set,
`array` returns `[]`, and `json`, `url`, and `enum` throw.

::: info Parsers read through env()

Every parser calls [`env()`](/api/env), so the same rules apply. In client components, use `NEXT_PUBLIC_` keys and
render [`PublicEnvScript`](/api/components#publicenvscript) or `EnvScript`. With the context approach, parse the strings
from `useEnvContext()` yourself.

:::

## boolean()

```ts
envParsers.boolean(key: string, defaultValue?: boolean): boolean
```

Trims and lowercases the value, then matches it against two lists.

| Value                                   | Result                                 |
| --------------------------------------- | -------------------------------------- |
| `true`, `1`, `yes`, `on` (any case)     | `true`                                 |
| `false`, `0`, `no`, `off` (any case)    | `false`                                |
| Anything else, including `''` and typos | `defaultValue` (`false` unless passed) |
| Not set                                 | `defaultValue`                         |

Never throws for its content, so a typo falls back to your default rather than flipping a flag.

```ts
const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG')
// Opt-out flag: on unless someone sets it to a recognized falsy value
const analytics = envParsers.boolean('NEXT_PUBLIC_ANALYTICS', true)
```

## number()

```ts
envParsers.number(key: string, defaultValue?: number): number
```

Converts with `Number()` and rejects anything that is not finite.

| Value                        | Result                             |
| ---------------------------- | ---------------------------------- |
| `3000`, `42`                 | `3000`, `42`                       |
| `3.14`, `-42`, `1e3`, `0x10` | `3.14`, `-42`, `1000`, `16`        |
| `''` or whitespace only      | `defaultValue` (`0` unless passed) |
| Not set                      | `defaultValue`                     |
| `abc`, `3000px`, `Infinity`  | Throws                             |

```text
Environment variable 'NEXT_PUBLIC_PAGE_SIZE' is not a valid number: 'abc'.
Expected a numeric value like '3000' or '3.14'.
```

```ts
const pageSize = envParsers.number('NEXT_PUBLIC_PAGE_SIZE', 20)
const timeoutMs = envParsers.number('NEXT_PUBLIC_TIMEOUT_MS', 5000)
```

Range checks stay yours: `number()` accepts `-1` and `2.5` for a page size.

## array()

```ts
envParsers.array(key: string, defaultValue?: string[]): string[]
```

Splits on commas, trims each item, and drops empty items. Never throws for its content.

| Value                  | Result                              |
| ---------------------- | ----------------------------------- |
| `auth,payments,search` | `['auth', 'payments', 'search']`    |
| ` auth , payments ,`   | `['auth', 'payments']`              |
| `''`                   | `[]`                                |
| Not set                | `defaultValue` (`[]` unless passed) |

```ts
const features = envParsers.array('NEXT_PUBLIC_FEATURES')

if (features.includes('payments')) {
    // render checkout
}
```

Items cannot contain commas. Use [`json()`](#json) for anything richer.

## json()

```ts
envParsers.json<T = unknown>(key: string, defaultValue?: T): T
```

Parses with `JSON.parse`. The generic is a cast, not a check, so validate the shape when it matters.

```ts
import { envParsers } from 'next-dynenv'
import { z } from 'zod'

const Flags = z.object({ checkout: z.boolean(), search: z.boolean() })

// NEXT_PUBLIC_FLAGS={"checkout":true,"search":false}
const flags = Flags.parse(envParsers.json('NEXT_PUBLIC_FLAGS', { checkout: false, search: false }))
```

Throws when the value is not set and there is no default:

```text
Required environment variable 'NEXT_PUBLIC_FLAGS' is not defined.
Expected a JSON string value.
```

And when the value is not valid JSON (including `''`):

```text
Environment variable 'NEXT_PUBLIC_FLAGS' is not valid JSON: '{checkout:true}'.
Expected a valid JSON string like '{"key":"value"}'.
```

## url()

```ts
envParsers.url(key: string, defaultValue?: string): string
```

Checks the value with `new URL()` and returns the original string unchanged, so `https://api.example.com` stays without
the trailing slash `new URL()` would add. Any absolute URL passes, including `postgres://` and `mailto:` schemes.
Relative paths such as `/api` throw. The default is returned as is, without validation.

```ts
const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const cdnUrl = envParsers.url('NEXT_PUBLIC_CDN_URL', 'https://cdn.example.com')
```

```text
Required environment variable 'NEXT_PUBLIC_API_URL' is not defined.
Expected a valid URL.
```

```text
Environment variable 'NEXT_PUBLIC_API_URL' is not a valid URL: 'api.example.com'.
Expected a valid URL like 'https://example.com'.
```

## enum()

```ts
envParsers.enum<T extends string>(key: string, allowedValues: readonly T[], defaultValue?: T): T
```

Returns the value when it exactly matches one of `allowedValues`. Matching is case-sensitive, so `Production` fails
against `'production'`. TypeScript infers `T` from the list; the default is typed against it but not checked at runtime.

```ts
const stage = envParsers.enum('NEXT_PUBLIC_STAGE', ['development', 'staging', 'production'] as const, 'development')
// stage: 'development' | 'staging' | 'production'
```

```text
Required environment variable 'NEXT_PUBLIC_STAGE' is not defined.
Expected one of: 'development', 'staging', 'production'.
```

```text
Environment variable 'NEXT_PUBLIC_STAGE' has invalid value: 'prod'.
Expected one of: 'development', 'staging', 'production'.
```

## Putting it together

Read config inside a function so values come from the request-time environment, not from whenever the module first
loaded.

```ts
// lib/public-config.ts
import { envParsers } from 'next-dynenv'

export function getPublicConfig() {
    return {
        apiUrl: envParsers.url('NEXT_PUBLIC_API_URL'),
        debug: envParsers.boolean('NEXT_PUBLIC_DEBUG'),
        features: envParsers.array('NEXT_PUBLIC_FEATURES'),
        pageSize: envParsers.number('NEXT_PUBLIC_PAGE_SIZE', 20),
        stage: envParsers.enum('NEXT_PUBLIC_STAGE', ['development', 'staging', 'production'] as const, 'development'),
    }
}
```

Catch errors with a narrowed type to report them your way:

```ts
try {
    getPublicConfig()
} catch (error) {
    if (error instanceof Error) {
        console.error(`Config error: ${error.message}`)
    }
    throw error
}
```

## Related

- [`env()`](/api/env) for raw strings
- [`requireEnv()`](/api/require-env) for required strings
- [Troubleshooting](/guide/troubleshooting) for values that parse differently than expected
