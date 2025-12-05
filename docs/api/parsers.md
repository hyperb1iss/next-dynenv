# envParsers

Type-safe parsers for converting environment variable strings into structured data. Because environment variables are
always strings, and you deserve better.

## Import

```ts
import { envParsers } from 'next-dynenv'
```

## Overview

Environment variables arrive as strings. `envParsers` transforms them into the types you actually need—booleans,
numbers, arrays, JSON objects, URLs, and type-safe enums—with validation and clear error messages.

::: tip Philosophy

- **Validate early**: Fail fast with clear errors, not mysterious bugs later
- **Sensible defaults**: Boolean returns `false`, number returns `0`, array returns `[]`
- **Type safety**: Full TypeScript support with generics where appropriate :::

## Parsers

### boolean()

Parse strings into boolean values. Perfect for feature flags.

```ts
envParsers.boolean(key: string, defaultValue?: boolean): boolean
```

**Truthy values** (case-insensitive): `'true'`, `'1'`, `'yes'`, `'on'` **Everything else**: `false` (or your default)

#### Examples

```tsx
// NEXT_PUBLIC_DEBUG=true → true
// NEXT_PUBLIC_DEBUG=1 → true
// NEXT_PUBLIC_DEBUG=yes → true
// NEXT_PUBLIC_DEBUG=ON → true
// NEXT_PUBLIC_DEBUG=false → false
// NEXT_PUBLIC_DEBUG=0 → false
// NEXT_PUBLIC_DEBUG=anything-else → false
// NEXT_PUBLIC_DEBUG=undefined → false (or your default)

const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG')
const enabled = envParsers.boolean('NEXT_PUBLIC_FEATURE_X', true) // Default: true
```

#### Common Use Cases

```tsx
import { envParsers } from 'next-dynenv'

// Feature flags
const showBetaFeatures = envParsers.boolean('NEXT_PUBLIC_BETA_FEATURES')
const enableAnalytics = envParsers.boolean('NEXT_PUBLIC_ANALYTICS', true)

// Debugging
const verbose = envParsers.boolean('NEXT_PUBLIC_VERBOSE')
const showDevTools = envParsers.boolean('NEXT_PUBLIC_DEV_TOOLS')
```

::: tip Never throws `boolean()` is forgiving. Invalid values default to `false`, not errors. Perfect for flags. :::

---

### number()

Parse strings into numeric values with validation. Throws for invalid numbers.

```ts
envParsers.number(key: string, defaultValue?: number): number
```

**Throws** if the value is defined but not a valid number (including `NaN` and `Infinity`).

#### Examples

```tsx
// NEXT_PUBLIC_PORT=3000 → 3000
// NEXT_PUBLIC_RATIO=3.14 → 3.14
// NEXT_PUBLIC_NEGATIVE=-42 → -42
// NEXT_PUBLIC_PORT=undefined → 0 (or your default)
// NEXT_PUBLIC_PORT=abc → throws Error

const port = envParsers.number('NEXT_PUBLIC_PORT', 3000)
const ratio = envParsers.number('NEXT_PUBLIC_RATIO', 1.0)
const timeout = envParsers.number('NEXT_PUBLIC_TIMEOUT_MS')
```

#### Common Use Cases

```tsx
import { envParsers } from 'next-dynenv'

// Configuration
const port = envParsers.number('NEXT_PUBLIC_PORT', 3000)
const timeout = envParsers.number('NEXT_PUBLIC_TIMEOUT', 5000)
const maxRetries = envParsers.number('NEXT_PUBLIC_MAX_RETRIES', 3)

// Pagination
const pageSize = envParsers.number('NEXT_PUBLIC_PAGE_SIZE', 20)
```

**Error message example:**

```
Environment variable 'NEXT_PUBLIC_PORT' is not a valid number: 'abc'.
Expected a numeric value like '3000' or '3.14'.
```

::: warning Validation Throws immediately for invalid numbers. Use this for critical numeric config that must be valid.
:::

---

### array()

Parse comma-separated strings into arrays. Perfect for lists of features, hosts, or tags.

```ts
envParsers.array(key: string, defaultValue?: string[]): string[]
```

**Parsing behavior:**

- Splits on commas
- Trims whitespace from each element
- Filters out empty strings
- Returns empty array if variable is undefined

#### Examples

```tsx
// NEXT_PUBLIC_FEATURES=auth,payments,analytics
// → ['auth', 'payments', 'analytics']

// NEXT_PUBLIC_HOSTS=localhost, 127.0.0.1, example.com
// → ['localhost', '127.0.0.1', 'example.com']

// Whitespace handling
// NEXT_PUBLIC_TAGS= tag1 , tag2 , tag3
// → ['tag1', 'tag2', 'tag3']

// Empty values
// NEXT_PUBLIC_EMPTY= → []
// NEXT_PUBLIC_MISSING=undefined → []

const features = envParsers.array('NEXT_PUBLIC_FEATURES')
const hosts = envParsers.array('NEXT_PUBLIC_HOSTS', ['localhost'])
```

#### Common Use Cases

```tsx
import { envParsers } from 'next-dynenv'

// Feature flags
const enabledFeatures = envParsers.array('NEXT_PUBLIC_FEATURES')
if (enabledFeatures.includes('payments')) {
    // Show payment UI
}

// Allowed hosts
const allowedOrigins = envParsers.array('NEXT_PUBLIC_ALLOWED_ORIGINS')

// Tags or categories
const categories = envParsers.array('NEXT_PUBLIC_CATEGORIES', ['general'])
```

::: tip Never throws Like `boolean()`, `array()` is forgiving. Invalid formats become empty arrays. :::

---

### json()

Parse JSON strings into typed objects. Use TypeScript generics for compile-time safety.

```ts
envParsers.json<T>(key: string, defaultValue?: T): T
```

**Throws** if:

- Value is defined but not valid JSON
- Value is undefined and no default provided

#### Examples

```tsx
// NEXT_PUBLIC_CONFIG={"api":"https://api.example.com","timeout":5000}

interface Config {
    api: string
    timeout: number
}

const config = envParsers.json<Config>('NEXT_PUBLIC_CONFIG')
const settings = envParsers.json<Settings>('NEXT_PUBLIC_SETTINGS', { theme: 'dark' })
```

#### Common Use Cases

```tsx
import { envParsers } from 'next-dynenv'

// Complex configuration
interface AppConfig {
    api: { baseUrl: string; timeout: number }
    features: { payments: boolean; analytics: boolean }
}

const config = envParsers.json<AppConfig>('NEXT_PUBLIC_CONFIG')

// Theme configuration
const themeConfig = envParsers.json<{ mode: 'light' | 'dark'; accent: string }>('NEXT_PUBLIC_THEME', {
    mode: 'dark',
    accent: '#007bff',
})
```

**Error message example:**

```
Environment variable 'NEXT_PUBLIC_CONFIG' is not valid JSON: '{"invalid}'.
Expected a valid JSON string like '{"key":"value"}'.
```

::: warning Type safety caveat TypeScript can't validate that the JSON matches your interface at runtime. Consider using
Zod or similar for runtime validation of complex configs. :::

---

### url()

Parse and validate URL strings. Ensures URLs are well-formed before use.

```ts
envParsers.url(key: string, defaultValue?: string): string
```

**Throws** if:

- Value is defined but not a valid URL
- Value is undefined and no default provided

#### Examples

```tsx
// NEXT_PUBLIC_API_URL=https://api.example.com/v1

const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const cdnUrl = envParsers.url('NEXT_PUBLIC_CDN_URL', 'https://cdn.example.com')
```

#### Common Use Cases

```tsx
import { envParsers } from 'next-dynenv'

// API endpoints
const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const graphqlUrl = envParsers.url('NEXT_PUBLIC_GRAPHQL_URL')

// CDN and assets
const cdnUrl = envParsers.url('NEXT_PUBLIC_CDN_URL', 'https://cdn.example.com')

// External services
const sentryDsn = envParsers.url('NEXT_PUBLIC_SENTRY_DSN')
```

**Error message example:**

```
Environment variable 'NEXT_PUBLIC_API_URL' is not a valid URL: 'not-a-url'.
Expected a valid URL like 'https://example.com'.
```

::: tip URL validation Uses browser-native `URL` constructor for validation. Catches malformed URLs before they cause
fetch errors. :::

---

### enum()

Parse strings into type-safe enum values. Enforces a whitelist of allowed values.

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

#### Examples

```tsx
// NEXT_PUBLIC_ENV=production

type Environment = 'development' | 'staging' | 'production'
const appEnv = envParsers.enum<Environment>('NEXT_PUBLIC_ENV', ['development', 'staging', 'production'], 'development')

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const logLevel = envParsers.enum<LogLevel>('NEXT_PUBLIC_LOG_LEVEL', ['debug', 'info', 'warn', 'error'])
```

#### Common Use Cases

```tsx
import { envParsers } from 'next-dynenv'

// Environment detection
type Env = 'development' | 'staging' | 'production'
const environment = envParsers.enum<Env>('NEXT_PUBLIC_ENV', ['development', 'staging', 'production'], 'development')

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const logLevel = envParsers.enum<LogLevel>('NEXT_PUBLIC_LOG_LEVEL', ['debug', 'info', 'warn', 'error'], 'info')

// Regions
type Region = 'us-east-1' | 'us-west-2' | 'eu-west-1'
const region = envParsers.enum<Region>('NEXT_PUBLIC_REGION', ['us-east-1', 'us-west-2', 'eu-west-1'])
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

::: tip Type safety Combines runtime validation with TypeScript's literal types for maximum safety. Typos are caught
immediately. :::

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

| Parser      | Returns    | Throws on Invalid | Default if Undefined | Use Case             |
| ----------- | ---------- | ----------------- | -------------------- | -------------------- |
| `boolean()` | `boolean`  | Never             | `false`              | Feature flags        |
| `number()`  | `number`   | Yes               | `0`                  | Ports, timeouts      |
| `array()`   | `string[]` | Never             | `[]`                 | Lists, tags          |
| `json()`    | `T`        | Yes               | Required\*           | Complex config       |
| `url()`     | `string`   | Yes               | Required\*           | API endpoints        |
| `enum()`    | `T`        | Yes               | Required\*           | Environments, levels |

\*Unless you provide a `defaultValue` parameter

## Related

- [env()](/api/env) - Basic string access
- [requireEnv()](/api/require-env) - Required string access
- [Security](/guide/security) - Security best practices
