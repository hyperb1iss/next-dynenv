# Security

next-dynenv is secure by default—multiple layers of protection baked in.

## Built-in Security Features

### XSS Protection

All environment values are JSON-escaped before injection to prevent script injection:

```tsx
// If someone maliciously sets:
NEXT_PUBLIC_XSS="</script><script>alert('hacked')</script>"

// It becomes safely escaped:
\u003c/script\u003e\u003cscript\u003ealert('hacked')\u003c/script\u003e
```

The browser renders it as harmless text, not executable code.

### Immutable Runtime Values

Environment values are frozen with `Object.freeze()`:

```tsx
// Any attempt to modify fails
window.__ENV.NEXT_PUBLIC_API_URL = 'https://evil.com'
// In strict mode, this throws. In sloppy mode, it fails silently.
```

This prevents client-side tampering with environment configuration.

### Strict Prefix Enforcement

Only `NEXT_PUBLIC_*` variables reach the browser. Try to access a secret? Error:

```tsx
'use client'

const secret = env('SECRET_KEY')
// ❌ Error: Environment variable 'SECRET_KEY' is not public
```

This prevents accidentally leaking server-side secrets to client code.

## Best Practices

### Never Expose Secrets to the Browser

::: danger Fundamental Rule Only `NEXT_PUBLIC_*` variables are exposed to the browser. **Never** put secrets, API keys,
tokens, or sensitive data in public variables. :::

```tsx
// ❌ WRONG - Trying to access secrets in client components
'use client'
const apiKey = env('SECRET_API_KEY') // Throws error!

// ✅ CORRECT - Use secrets only server-side
// app/api/data/route.ts
export async function GET() {
    const apiKey = env('SECRET_API_KEY') // Works!
    // Fetch data securely server-side
}
```

**Golden rule:** If it's secret, keep it server-side.

### Validate Required Variables

Fail fast when critical variables are missing:

```tsx
import { requireEnv } from 'next-dynenv'

// Throws immediately if undefined (better than runtime surprises)
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
```

::: tip Development vs Production Use `requireEnv()` for variables your app can't function without. Use `env()` with
defaults for optional config. :::

### Use Type-Safe Parsers

Parse and validate environment variables:

```tsx
import { envParsers } from 'next-dynenv'

// Type-safe parsing with validation
const port = envParsers.number('NEXT_PUBLIC_PORT') // number
const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL') // validated URL
const env = envParsers.enum('NEXT_PUBLIC_ENV', ['dev', 'staging', 'prod']) // enum
```

These throw meaningful errors if values are invalid, catching config issues early.

## Content Security Policy (CSP)

If your app uses CSP, you have two options for allowing the environment script:

### Option 1: Allow Inline Scripts

Simpler, but less strict:

```js
// next.config.js
const ContentSecurityPolicy = `
  script-src 'self' 'unsafe-inline';
`
```

::: warning Security Tradeoff `'unsafe-inline'` weakens your CSP by allowing all inline scripts, not just next-dynenv's.
:::

### Option 2: Use Nonce (Recommended)

More secure—only allow specific scripts:

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

Or let next-dynenv fetch the nonce automatically:

```tsx
<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
```

## Server vs Client Environment Access

| Context           | Access Method            | Variables Available  |
| ----------------- | ------------------------ | -------------------- |
| Server Components | `env()` or `process.env` | All variables        |
| API Routes        | `env()` or `process.env` | All variables        |
| Middleware        | `env()` or `process.env` | All variables        |
| Client Components | `env()` only             | Only `NEXT_PUBLIC_*` |

::: tip Best Practice Use `env()` everywhere for consistency. It works in all contexts and provides clear error messages
when you try to access secrets from client code. :::
