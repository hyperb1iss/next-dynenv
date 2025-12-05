# Security

next-dynenv includes multiple layers of security by default.

## Built-in Security Features

### XSS Protection

All environment values are JSON-escaped before injection into the HTML. This prevents script injection attacks:

```tsx
// If someone sets:
// NEXT_PUBLIC_XSS="</script><script>alert('hacked')</script>"

// It becomes safely escaped:
// \u003c/script\u003e\u003cscript\u003ealert('hacked')\u003c/script\u003e
```

### Immutable Runtime Values

Environment values are wrapped with `Object.freeze()`, preventing modification after initialization:

```tsx
// This will fail silently (or throw in strict mode)
window.__ENV.NEXT_PUBLIC_API_URL = 'https://evil.com'
```

### Strict Prefix Enforcement

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Attempting to access non-public variables in
client code throws an error:

```tsx
'use client'

// This throws: "Environment variable 'SECRET_KEY' is not public"
const secret = env('SECRET_KEY')
```

## Best Practices

### Never Expose Secrets to the Browser

::: danger Only `NEXT_PUBLIC_*` variables are exposed to the browser. Never expose sensitive data. :::

```tsx
// ❌ WRONG - Don't try to access secrets in client components
'use client'
const apiKey = env('SECRET_API_KEY') // Throws error!

// ✅ CORRECT - Use secrets only server-side
// app/api/data/route.ts
export async function GET() {
    const apiKey = env('SECRET_API_KEY') // Works!
    // ... fetch data securely
}
```

### Validate Required Variables

Use `requireEnv()` to fail fast when critical variables are missing:

```tsx
import { requireEnv } from 'next-dynenv'

// Throws immediately if undefined
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
```

### Use Type-Safe Parsers

Parse environment variables to their expected types:

```tsx
import { envParsers } from 'next-dynenv'

// Validates and throws if invalid
const port = envParsers.number('NEXT_PUBLIC_PORT')
const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const env = envParsers.enum('NEXT_PUBLIC_ENV', ['dev', 'staging', 'prod'])
```

## Content Security Policy

If using CSP, you have two options:

### Option 1: Allow Inline Scripts (Simpler)

```js
// next.config.js
const ContentSecurityPolicy = `
  script-src 'self' 'unsafe-inline';
`
```

### Option 2: Use Nonce (More Secure)

Pass a nonce to the component:

```tsx
// app/layout.tsx
import { headers } from 'next/headers'
import { PublicEnvScript } from 'next-dynenv'

export default async function RootLayout({ children }) {
    const headersList = await headers()
    const nonce = headersList.get('x-nonce')

    return (
        <html>
            <head>
                <PublicEnvScript nonce={nonce} />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

Or retrieve the nonce from headers automatically:

```tsx
<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
```

## Server vs Client Environment Access

| Context           | Access                   | Variables Available  |
| ----------------- | ------------------------ | -------------------- |
| Server Components | `env()` or `process.env` | All variables        |
| API Routes        | `env()` or `process.env` | All variables        |
| Middleware        | `env()` or `process.env` | All variables        |
| Client Components | `env()` only             | Only `NEXT_PUBLIC_*` |

::: tip Recommendation Use `env()` everywhere for consistency. It works in all contexts and provides better error
messages when misused. :::
