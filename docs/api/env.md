# env()

Access environment variables isomorphically (server and client).

## Import

```ts
import { env } from 'next-dynenv'
```

## Signature

```ts
function env(key: string): string | undefined
function env<T extends string>(key: string, defaultValue: T): string
```

## Parameters

| Parameter      | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `key`          | `string` | The environment variable name       |
| `defaultValue` | `string` | Optional default value if undefined |

## Returns

- `string` - The environment variable value
- `undefined` - If the variable is undefined and no default is provided

## Throws

- `Error` - When called in the browser with a non-public variable name (doesn't start with `NEXT_PUBLIC_`)

## Behavior

### Server-Side

Reads directly from `process.env`:

```ts
// Server component or API route
const apiUrl = env('NEXT_PUBLIC_API_URL') // From process.env
const secret = env('SECRET_KEY') // From process.env
const dbUrl = env('DATABASE_URL') // From process.env
```

### Client-Side

Reads from `window.__ENV` (set by `PublicEnvScript`):

```tsx
'use client'
import { env } from 'next-dynenv'

const apiUrl = env('NEXT_PUBLIC_API_URL') // From window.__ENV
const secret = env('SECRET_KEY') // Throws Error!
```

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

### Type Narrowing

```tsx
import { env } from 'next-dynenv'

const maybeUrl = env('NEXT_PUBLIC_API_URL')
// Type: string | undefined

if (maybeUrl) {
    // Type: string (narrowed)
    fetch(maybeUrl)
}

const definiteUrl = env('NEXT_PUBLIC_API_URL', 'https://fallback.com')
// Type: string (no undefined thanks to default)
```

## Error Messages

### Non-Public Variable in Browser

```tsx
'use client'
const secret = env('SECRET_KEY')
```

Throws:

```
Error: Environment variable 'SECRET_KEY' is not public and cannot be accessed in the browser.
To fix this:
  1. Rename to 'NEXT_PUBLIC_SECRET_KEY' if it should be public, or
  2. Use makeEnvPublic('SECRET_KEY') in next.config.js, or
  3. Access from a server component or API route instead
```

## Related

- [requireEnv()](/api/require-env) - Throws if undefined
- [envParsers](/api/parsers) - Type-safe parsing
- [PublicEnvScript](/api/components) - Inject variables into browser
