# requireEnv()

Access required environment variables that throw if undefined.

## Import

```ts
import { requireEnv } from 'next-dynenv'
```

## Signature

```ts
function requireEnv(key: string): string
```

## Parameters

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `key`     | `string` | The environment variable name |

## Returns

- `string` - The environment variable value (guaranteed to be defined)

## Throws

- `Error` - When the environment variable is undefined
- `Error` - When called in the browser with a non-public variable name

## When to Use

Use `requireEnv()` when:

- The variable **must** exist for your app to function
- You want to fail fast rather than have silent bugs
- You need a guaranteed `string` type (not `string | undefined`)

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

| Feature       | `env()`               | `requireEnv()`     |
| ------------- | --------------------- | ------------------ |
| Return type   | `string \| undefined` | `string`           |
| Missing value | Returns `undefined`   | Throws error       |
| Default value | Supported             | Not supported      |
| Use case      | Optional variables    | Required variables |

## Best Practices

### Validate at Startup

```ts
// lib/config.ts
import { requireEnv } from 'next-dynenv'

// Fails fast at import time, not when first used
export const config = {
    apiUrl: requireEnv('NEXT_PUBLIC_API_URL'),
    appName: requireEnv('NEXT_PUBLIC_APP_NAME'),
    analyticsId: requireEnv('NEXT_PUBLIC_ANALYTICS_ID'),
}
```

### Combine with Type Parsers

```tsx
import { requireEnv } from 'next-dynenv'
import { envParsers } from 'next-dynenv'

// For strings - use requireEnv
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')

// For other types - use envParsers (which throw by default for required values)
const port = envParsers.number('NEXT_PUBLIC_PORT') // Throws if NaN
const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG') // Returns false if undefined
```

## Related

- [env()](/api/env) - Optional access with defaults
- [envParsers](/api/parsers) - Type-safe parsing
- [Security](/guide/security) - Security best practices
