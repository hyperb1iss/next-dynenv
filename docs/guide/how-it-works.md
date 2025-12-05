# How It Works

Understanding the magic behind runtime environment variables.

## The Problem with Build-Time Variables

By default, Next.js bakes `NEXT_PUBLIC_*` environment variables into your JavaScript bundle at **build time**:

```bash
# Build in CI with staging config
NEXT_PUBLIC_API_URL=https://staging-api.com npm run build

# Deploy the same build to production
# Problem: It STILL points to staging-api.com
# You need a separate production build to change it
```

This breaks modern deployment workflows:

- **Docker** - You want one image for all environments
- **Kubernetes** - ConfigMaps should change behavior without rebuilding
- **Feature flags** - Toggle features without CI/CD cycles
- **Multi-tenant** - Different configs per customer without separate builds

## The Solution: Runtime Injection

next-dynenv injects environment variables at **runtime**, not build time:

```
┌─────────────────────────────────────────────────────────────┐
│                     Server (Runtime)                        │
│                                                             │
│  1. Request arrives                                         │
│  2. Server reads process.env.NEXT_PUBLIC_*                  │
│  3. PublicEnvScript serializes to JSON                      │
│  4. HTML includes: <script>window.__ENV = {...}</script>    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│                                                             │
│  1. Page loads                                              │
│  2. Script sets window.__ENV                                │
│  3. env('NEXT_PUBLIC_API_URL') reads from window.__ENV      │
│  4. Values are current, not build-time values               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Dynamic Rendering

next-dynenv uses Next.js 15+'s `connection()` API to force dynamic rendering:

```tsx
// Inside PublicEnvScript (simplified)
import { connection } from 'next/server'

export const PublicEnvScript = async () => {
    // This tells Next.js: "Don't cache this, render it fresh every time"
    await connection()

    // Now process.env is read at request time, not build time
    const publicEnv = getPublicEnv()

    return <script>window.__ENV = {JSON.stringify(publicEnv)}</script>
}
```

::: info Why This Matters Without `connection()`, Next.js might cache the rendered HTML during static generation,
freezing your environment values at build time—defeating the entire purpose. :::

## Security Measures

Security is baked in, not bolted on.

### XSS Prevention

All environment values are JSON-escaped before injection to prevent script injection:

```tsx
// If someone maliciously sets:
NEXT_PUBLIC_XSS="</script><script>alert('hacked')</script>"

// It becomes safely escaped:
\u003c/script\u003e\u003cscript\u003ealert('hacked')\u003c/script\u003e
```

The browser renders it as harmless text, not executable code.

### Immutable Values

The environment object is frozen to prevent tampering:

```tsx
window.__ENV = Object.freeze({ ... })

// Any attempt to modify fails
window.__ENV.NEXT_PUBLIC_API_URL = 'https://evil.com' // No effect
```

::: tip Strict Mode In strict mode, modification attempts throw an error instead of failing silently. :::

### Prefix Enforcement

Only `NEXT_PUBLIC_*` variables are exposed to the browser. Try to access a secret? You get an error:

```tsx
'use client'

const secret = env('SECRET_KEY')
// ❌ Error: Environment variable 'SECRET_KEY' is not public
```

This prevents accidentally leaking secrets to client-side code.

## Two Approaches

next-dynenv offers two ways to access environment variables in client components.

### Script Approach (Recommended)

Injects a `<script>` tag that sets `window.__ENV`:

```tsx
// app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'
;<head>
    <PublicEnvScript />
</head>
```

Then use the `env()` function anywhere:

```tsx
import { env } from 'next-dynenv'
const apiUrl = env('NEXT_PUBLIC_API_URL')
```

**Why it's recommended:**

- Works outside React (vanilla JS, third-party libraries)
- Simpler setup
- Better compatibility with tools like Sentry
- One import, works everywhere

### Context Approach

Uses React Context for a pure React pattern:

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'
;<body>
    <PublicEnvProvider>{children}</PublicEnvProvider>
</body>
```

Access via hook:

```tsx
import { useEnvContext } from 'next-dynenv'
const { NEXT_PUBLIC_API_URL } = useEnvContext()
```

**Why you might prefer it:**

- Pure React pattern (no global state)
- Better TypeScript inference
- Explicit dependency via React tree

## Isomorphic Access

The `env()` function is **isomorphic**—it works the same everywhere:

```tsx
import { env } from 'next-dynenv'

// Server component: reads from process.env
const apiUrl = env('NEXT_PUBLIC_API_URL')

// Client component: reads from window.__ENV
const apiUrl = env('NEXT_PUBLIC_API_URL')

// Middleware: reads from process.env
const apiUrl = env('NEXT_PUBLIC_API_URL')
```

Write once, run anywhere.

## Next Steps

- [Script Approach](/guide/script-approach) - Detailed script setup
- [Context Approach](/guide/context-approach) - React Context setup
- [Docker Deployment](/guide/docker) - Container deployment patterns
