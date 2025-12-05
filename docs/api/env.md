# env()

The workhorse function of `next-dynenv`. Access environment variables everywhere—server components, client components,
API routes, middleware—with a single, unified interface.

## Import

```ts
import { env } from 'next-dynenv'
```

## Signature

```ts
function env(key: string): string | undefined
function env<T extends string>(key: string, defaultValue: T): string
```

The overload with `defaultValue` returns `string` (never `undefined`), giving you cleaner code without null checks.

## Parameters

| Parameter      | Type     | Description                                   |
| -------------- | -------- | --------------------------------------------- |
| `key`          | `string` | Environment variable name                     |
| `defaultValue` | `string` | Optional default value if variable is not set |

## Returns

| Scenario                       | Return Type | Example                                 |
| ------------------------------ | ----------- | --------------------------------------- |
| Variable exists                | `string`    | `env('NEXT_PUBLIC_API_URL')`            |
| Variable missing, no default   | `undefined` | `env('NEXT_PUBLIC_MISSING')`            |
| Variable missing, with default | `string`    | `env('NEXT_PUBLIC_MISSING', 'default')` |

## Throws

`env()` throws an error when:

- Called in the browser with a non-public variable (doesn't start with `NEXT_PUBLIC_`)

This prevents accidentally leaking server secrets to the client.

## How It Works

### Server-Side

On the server, `env()` reads directly from `process.env`. All variables are accessible:

```ts
// Server component, API route, or middleware
const apiUrl = env('NEXT_PUBLIC_API_URL') // Public variable
const secret = env('SECRET_KEY') // Private variable
const dbUrl = env('DATABASE_URL') // Private variable
```

### Client-Side

In the browser, `env()` reads from `window.__ENV`, which is populated by `PublicEnvScript`. Only `NEXT_PUBLIC_*`
variables are available:

```tsx
'use client'
import { env } from 'next-dynenv'

const apiUrl = env('NEXT_PUBLIC_API_URL') // Works - public variable
const secret = env('SECRET_KEY') // Throws Error - private variable!
```

::: tip Why the restriction? Next.js bundles `NEXT_PUBLIC_*` variables at build time, making them static. `next-dynenv`
makes them truly runtime by injecting them via script tag. Non-public variables are server-only for security. :::

## Examples

### Basic Usage

```tsx
import { env } from 'next-dynenv'

// Simple access
const apiUrl = env('NEXT_PUBLIC_API_URL')
// Returns: "https://api.example.com" or undefined
```

### With Default Value

```tsx
import { env } from 'next-dynenv'

// With default (return type is string, not string | undefined)
const apiUrl = env('NEXT_PUBLIC_API_URL', 'https://default-api.com')
const timeout = env('NEXT_PUBLIC_TIMEOUT', '5000')
const debug = env('NEXT_PUBLIC_DEBUG', 'false')
```

### In Client Components

```tsx
'use client'

import { env } from 'next-dynenv'

export function ApiClient() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const appName = env('NEXT_PUBLIC_APP_NAME', 'MyApp')

    return (
        <div>
            <p>Connecting to: {apiUrl}</p>
            <p>App: {appName}</p>
        </div>
    )
}
```

### In Server Components

```tsx
import { env } from 'next-dynenv'

export default function ServerComponent() {
    // Public variables
    const apiUrl = env('NEXT_PUBLIC_API_URL')

    // Private variables (server-only)
    const dbUrl = env('DATABASE_URL')
    const apiKey = env('SECRET_API_KEY')

    return (
        <div>
            <p>API: {apiUrl}</p>
            {/* Never expose secrets in JSX */}
        </div>
    )
}
```

### In API Routes

```ts
// app/api/data/route.ts
import { env } from 'next-dynenv'

export async function GET() {
    const apiKey = env('SECRET_API_KEY')
    const apiUrl = env('NEXT_PUBLIC_API_URL')

    const response = await fetch(apiUrl!, {
        headers: { Authorization: `Bearer ${apiKey}` },
    })

    return Response.json(await response.json())
}
```

### In Middleware

```ts
// middleware.ts
import { env } from 'next-dynenv'
import { NextResponse } from 'next/server'

export function middleware(request) {
    const maintenanceMode = env('NEXT_PUBLIC_MAINTENANCE', 'false')

    if (maintenanceMode === 'true') {
        return NextResponse.redirect(new URL('/maintenance', request.url))
    }

    return NextResponse.next()
}
```

### Type Narrowing with TypeScript

TypeScript understands the default value overload, eliminating `undefined` from the type:

```tsx
import { env } from 'next-dynenv'

const maybeUrl = env('NEXT_PUBLIC_API_URL')
// Type: string | undefined
// You must check before using:
if (maybeUrl) {
    fetch(maybeUrl) // Type: string (narrowed)
}

const definiteUrl = env('NEXT_PUBLIC_API_URL', 'https://fallback.com')
// Type: string (never undefined thanks to default)
fetch(definiteUrl) // No check needed
```

### Conditional Defaults

```tsx
import { env } from 'next-dynenv'

// Different defaults per environment
const apiUrl = env(
    'NEXT_PUBLIC_API_URL',
    process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://api.example.com',
)
```

### Working with Undefined Values

```tsx
import { env } from 'next-dynenv'

// Option 1: Use default value
const timeout = env('NEXT_PUBLIC_TIMEOUT', '5000')

// Option 2: Nullish coalescing
const timeout2 = env('NEXT_PUBLIC_TIMEOUT') ?? '5000'

// Option 3: Check explicitly
const rawTimeout = env('NEXT_PUBLIC_TIMEOUT')
if (!rawTimeout) {
    console.warn('NEXT_PUBLIC_TIMEOUT not set, using default')
}
const timeout3 = rawTimeout ?? '5000'
```

## Error Messages

### Non-Public Variable in Browser

When you try to access a non-public variable from client-side code:

```tsx
'use client'
const secret = env('SECRET_KEY')
```

You'll get a helpful error:

```
Error: Environment variable 'SECRET_KEY' is not public and cannot be accessed in the browser.
To fix this:
  1. Rename to 'NEXT_PUBLIC_SECRET_KEY' if it should be public, or
  2. Use makeEnvPublic('SECRET_KEY') in next.config.js, or
  3. Access from a server component or API route instead
```

::: warning Security first This error is intentional. Never expose secrets to the browser. If you need this variable
client-side, it probably shouldn't be a secret. :::

## Related

- [requireEnv()](/api/require-env) - Throws if undefined
- [envParsers](/api/parsers) - Type-safe parsing
- [PublicEnvScript](/api/components) - Inject variables into browser
