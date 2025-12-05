# requireEnv()

The strict sibling of `env()`. Use when environment variables are **required** for your app to function. Throws
immediately if missing, giving you fail-fast behavior and clean `string` types.

## Import

```ts
import { requireEnv } from 'next-dynenv'
```

## Signature

```ts
function requireEnv(key: string): string
```

No overloads. No defaults. Just required values.

## Parameters

| Parameter | Type     | Description                          |
| --------- | -------- | ------------------------------------ |
| `key`     | `string` | Environment variable name (required) |

## Returns

`string` - The environment variable value, guaranteed to exist.

TypeScript knows this function never returns `undefined`, eliminating the need for null checks.

## Throws

`requireEnv()` throws errors in these scenarios:

| Scenario                       | Error Message                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------- |
| Variable is undefined          | `Required environment variable 'KEY' is not defined.`                             |
| Non-public variable in browser | `Environment variable 'KEY' is not public and cannot be accessed in the browser.` |

## When to Use

Use `requireEnv()` when:

- The variable **must** exist for your app to function
- You want to fail fast at startup rather than runtime
- You need a guaranteed `string` type (not `string | undefined`)
- You're setting up critical configuration like database URLs, API keys, or service endpoints

::: tip Fail fast, fail loud Better to crash at startup with a clear error than to fail mysteriously later with
`undefined` values. :::

## Examples

### Basic Usage

```tsx
import { requireEnv } from 'next-dynenv'

// Throws immediately if undefined
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
// Type: string (not string | undefined)
```

### In Configuration

```tsx
import { requireEnv } from 'next-dynenv'

// App won't start without these
const config = {
    apiUrl: requireEnv('NEXT_PUBLIC_API_URL'),
    appName: requireEnv('NEXT_PUBLIC_APP_NAME'),
}
```

### Server-Side Secrets

```ts
// app/api/data/route.ts
import { requireEnv } from 'next-dynenv'

export async function GET() {
    // Ensures secrets are configured
    const apiKey = requireEnv('SECRET_API_KEY')
    const dbUrl = requireEnv('DATABASE_URL')

    // Safe to use - we know they exist
    const db = connectToDatabase(dbUrl)
    // ...
}
```

### Type Safety

```tsx
import { env, requireEnv } from 'next-dynenv'

// Without requireEnv - must handle undefined
const maybeUrl = env('NEXT_PUBLIC_API_URL')
if (!maybeUrl) {
    throw new Error('Missing API URL')
}
fetch(maybeUrl) // Now safe

// With requireEnv - cleaner code
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
fetch(apiUrl) // Already safe, no check needed
```

### Conditional Requirements

```tsx
import { env, requireEnv } from 'next-dynenv'

// Only require in production
const apiUrl =
    process.env.NODE_ENV === 'production'
        ? requireEnv('NEXT_PUBLIC_API_URL')
        : env('NEXT_PUBLIC_API_URL', 'http://localhost:8080')

// Require based on feature flags
const analyticsId = process.env.ENABLE_ANALYTICS ? requireEnv('NEXT_PUBLIC_ANALYTICS_ID') : undefined
```

### In Client Components

```tsx
'use client'

import { requireEnv } from 'next-dynenv'

export function PaymentForm() {
    // Fail fast if payment config is missing
    const stripeKey = requireEnv('NEXT_PUBLIC_STRIPE_KEY')

    return <StripeProvider publishableKey={stripeKey}>{/* ... */}</StripeProvider>
}
```

## Error Messages

### Missing Variable

```tsx
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
```

If `NEXT_PUBLIC_API_URL` is not set:

```
Error: Required environment variable 'NEXT_PUBLIC_API_URL' is not defined.
Please set it in your environment or .env file.
```

### Non-Public Variable in Browser

```tsx
'use client'
const secret = requireEnv('SECRET_KEY')
```

Throws:

```
Error: Environment variable 'SECRET_KEY' is not public and cannot be accessed in the browser.
```

## Comparison with env()

| Feature       | `env()`                 | `requireEnv()`     |
| ------------- | ----------------------- | ------------------ |
| Return type   | `string \| undefined`   | `string` (always)  |
| Missing value | Returns `undefined`     | Throws error       |
| Default value | Supported via parameter | Not supported      |
| Use case      | Optional variables      | Required variables |
| Type safety   | Need null checks        | No checks needed   |

Choose based on whether the variable is truly required or merely optional with a sensible fallback.

## Best Practices

### Validate at Startup

Create a config module that fails fast at import time:

```ts
// lib/config.ts
import { requireEnv } from 'next-dynenv'

// All required variables validated immediately when this module loads
// App won't start if any are missing
export const config = {
    apiUrl: requireEnv('NEXT_PUBLIC_API_URL'),
    appName: requireEnv('NEXT_PUBLIC_APP_NAME'),
    analyticsId: requireEnv('NEXT_PUBLIC_ANALYTICS_ID'),
}
```

Then import this config throughout your app:

```tsx
// app/components/Header.tsx
import { config } from '@/lib/config'

export function Header() {
    return <h1>{config.appName}</h1>
}
```

::: tip Startup validation This pattern ensures all required env vars are set before any component renders. No surprises
at runtime. :::

### Combine with Type Parsers

For non-string types, use `envParsers` instead of `requireEnv()`:

```tsx
import { requireEnv, envParsers } from 'next-dynenv'

// Strings - use requireEnv
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')

// Other types - use envParsers (they throw for required values)
const port = envParsers.number('NEXT_PUBLIC_PORT') // Throws if NaN or missing
const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG') // Returns false if undefined (booleans have sensible defaults)
const features = envParsers.array('NEXT_PUBLIC_FEATURES') // Returns [] if undefined
```

### Guard Against Development Mistakes

```tsx
import { requireEnv } from 'next-dynenv'

// Prevent deploying without required vars
if (process.env.NODE_ENV === 'production') {
    requireEnv('NEXT_PUBLIC_API_URL')
    requireEnv('NEXT_PUBLIC_STRIPE_KEY')
    requireEnv('NEXT_PUBLIC_SENTRY_DSN')
}
```

## Related

- [env()](/api/env) - Optional access with defaults
- [envParsers](/api/parsers) - Type-safe parsing
- [Security](/guide/security) - Security best practices
