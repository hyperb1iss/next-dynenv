# envParsers

Type-safe environment variable parsers for common data types.

## Import

```ts
import { envParsers } from 'next-dynenv'
```

## Overview

Environment variables are always strings. `envParsers` provides utilities to convert them to typed values with
validation and sensible defaults.

## Parsers

### boolean()

Parse as a boolean value.

```ts
envParsers.boolean(key: string, defaultValue?: boolean): boolean
```

**Truthy values** (case-insensitive): `'true'`, `'1'`, `'yes'`, `'on'`

All other values return `false` (or the default).

```tsx
// NEXT_PUBLIC_DEBUG=true → true
// NEXT_PUBLIC_DEBUG=1 → true
// NEXT_PUBLIC_DEBUG=yes → true
// NEXT_PUBLIC_DEBUG=false → false
// NEXT_PUBLIC_DEBUG=anything → false
// NEXT_PUBLIC_DEBUG undefined → false (or default)

const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG')
const enabled = envParsers.boolean('NEXT_PUBLIC_FEATURE', true)
```

---

### number()

Parse as a number value.

```ts
envParsers.number(key: string, defaultValue?: number): number
```

**Throws** if the value is defined but not a valid number.

```tsx
// NEXT_PUBLIC_PORT=3000 → 3000
// NEXT_PUBLIC_RATIO=3.14 → 3.14
// NEXT_PUBLIC_PORT undefined → 0 (or default)
// NEXT_PUBLIC_PORT=abc → throws Error

const port = envParsers.number('NEXT_PUBLIC_PORT', 3000)
const ratio = envParsers.number('NEXT_PUBLIC_RATIO', 1.0)
```

**Error message:**

```
Environment variable 'NEXT_PUBLIC_PORT' is not a valid number: 'abc'.
Expected a numeric value like '3000' or '3.14'.
```

---

### array()

Parse as a comma-separated array of strings.

```ts
envParsers.array(key: string, defaultValue?: string[]): string[]
```

- Splits on commas
- Trims whitespace from each element
- Filters out empty strings

```tsx
// NEXT_PUBLIC_FEATURES=auth,payments,analytics
// → ['auth', 'payments', 'analytics']

// NEXT_PUBLIC_HOSTS=localhost, 127.0.0.1, example.com
// → ['localhost', '127.0.0.1', 'example.com']

// NEXT_PUBLIC_EMPTY= → []
// NEXT_PUBLIC_MISSING undefined → []

const features = envParsers.array('NEXT_PUBLIC_FEATURES')
const hosts = envParsers.array('NEXT_PUBLIC_HOSTS', ['localhost'])
```

---

### json()

Parse as JSON with type safety.

```ts
envParsers.json<T>(key: string, defaultValue?: T): T
```

**Throws** if:

- Value is defined but not valid JSON
- Value is undefined and no default provided

```tsx
// NEXT_PUBLIC_CONFIG={"api":"https://api.example.com","timeout":5000}

interface Config {
    api: string
    timeout: number
}

const config = envParsers.json<Config>('NEXT_PUBLIC_CONFIG')
const settings = envParsers.json<Settings>('NEXT_PUBLIC_SETTINGS', { theme: 'dark' })
```

**Error message:**

```
Environment variable 'NEXT_PUBLIC_CONFIG' is not valid JSON: '{"invalid}'.
Expected a valid JSON string like '{"key":"value"}'.
```

---

### url()

Parse and validate as a URL.

```ts
envParsers.url(key: string, defaultValue?: string): string
```

**Throws** if:

- Value is defined but not a valid URL
- Value is undefined and no default provided

```tsx
// NEXT_PUBLIC_API_URL=https://api.example.com/v1

const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const cdnUrl = envParsers.url('NEXT_PUBLIC_CDN_URL', 'https://cdn.example.com')
```

**Error message:**

```
Environment variable 'NEXT_PUBLIC_API_URL' is not a valid URL: 'not-a-url'.
Expected a valid URL like 'https://example.com'.
```

---

### enum()

Parse as one of a set of allowed values.

```ts
envParsers.enum<T extends string>(
  key: string,
  allowedValues: readonly T[],
  defaultValue?: T
): T
```

**Throws** if:

- Value is not in the allowed values list
- Value is undefined and no default provided

```tsx
// NEXT_PUBLIC_ENV=production

type Environment = 'development' | 'staging' | 'production'
const appEnv = envParsers.enum<Environment>('NEXT_PUBLIC_ENV', ['development', 'staging', 'production'], 'development')

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const logLevel = envParsers.enum<LogLevel>('NEXT_PUBLIC_LOG_LEVEL', ['debug', 'info', 'warn', 'error'])
```

**Error messages:**

Missing value (no default):

```
Required environment variable 'NEXT_PUBLIC_ENV' is not defined.
Expected one of: 'development', 'staging', 'production'.
```

Invalid value:

```
Environment variable 'NEXT_PUBLIC_ENV' has invalid value: 'invalid'.
Expected one of: 'development', 'staging', 'production'.
```

## Complete Example

```tsx
import { envParsers } from 'next-dynenv'

// Configuration with type-safe parsing
const config = {
    // Boolean flag
    debug: envParsers.boolean('NEXT_PUBLIC_DEBUG'),

    // Number with default
    port: envParsers.number('NEXT_PUBLIC_PORT', 3000),
    timeout: envParsers.number('NEXT_PUBLIC_TIMEOUT', 5000),

    // Array of features
    features: envParsers.array('NEXT_PUBLIC_FEATURES'),

    // Validated URL
    apiUrl: envParsers.url('NEXT_PUBLIC_API_URL'),

    // Enum with type safety
    environment: envParsers.enum('NEXT_PUBLIC_ENV', ['development', 'staging', 'production'] as const, 'development'),

    // JSON configuration
    theme: envParsers.json<{ mode: 'light' | 'dark'; accent: string }>('NEXT_PUBLIC_THEME', {
        mode: 'dark',
        accent: '#007bff',
    }),
}
```

## Error Handling

All parsers provide clear error messages:

```tsx
try {
    const port = envParsers.number('NEXT_PUBLIC_PORT')
} catch (error) {
    console.error(error.message)
    // "Environment variable 'NEXT_PUBLIC_PORT' is not a valid number: 'abc'."
}
```

## Summary Table

| Parser      | Returns    | Throws on Invalid | Default  |
| ----------- | ---------- | ----------------- | -------- |
| `boolean()` | `boolean`  | Never             | `false`  |
| `number()`  | `number`   | Yes               | `0`      |
| `array()`   | `string[]` | Never             | `[]`     |
| `json()`    | `T`        | Yes               | Required |
| `url()`     | `string`   | Yes               | Required |
| `enum()`    | `T`        | Yes               | Required |

## Related

- [env()](/api/env) - Basic string access
- [requireEnv()](/api/require-env) - Required string access
- [Security](/guide/security) - Security best practices
