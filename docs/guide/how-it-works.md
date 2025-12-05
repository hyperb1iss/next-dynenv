# How It Works

Understanding the mechanism behind runtime environment variables.

## The Problem

By default, Next.js bakes `NEXT_PUBLIC_*` environment variables into your JavaScript bundle at **build time**. This
means:

```bash
# Build in CI
NEXT_PUBLIC_API_URL=https://staging-api.com npm run build

# The same build deployed to production still uses staging-api.com!
# You need to rebuild to change the value.
```

This creates challenges for:

- **Docker**: You want one image for all environments
- **Kubernetes**: ConfigMaps should change behavior without rebuilding
- **Multi-tenant**: Different customers need different configurations

## The Solution

next-dynenv injects environment variables at **runtime** instead of build time:

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

next-dynenv uses Next.js 15+'s `connection()` API to opt into dynamic rendering:

```tsx
// Inside PublicEnvScript (simplified)
import { connection } from 'next/server'

export const PublicEnvScript = async () => {
    // This tells Next.js to render dynamically, not statically
    await connection()

    // Now process.env is read at request time, not build time
    const publicEnv = getPublicEnv()

    return <script>window.__ENV = {JSON.stringify(publicEnv)}</script>
}
```

Without `connection()`, Next.js might cache the rendered HTML with stale environment values.

## Security Measures

### XSS Prevention

Environment values are JSON-escaped before injection:

```tsx
// If someone tries: NEXT_PUBLIC_XSS="</script><script>alert('hacked')"
// It becomes: \u003c/script\u003e\u003cscript\u003ealert('hacked')\u003c/script\u003e
```

### Immutable Values

The environment object is frozen to prevent tampering:

```tsx
window.__ENV = Object.freeze({ ... })

// Attempts to modify fail silently (or throw in strict mode)
window.__ENV.NEXT_PUBLIC_API_URL = 'https://evil.com' // No effect
```

### Prefix Enforcement

Only `NEXT_PUBLIC_*` variables are exposed. Attempting to access non-public variables in the browser throws an error:

```tsx
'use client'
const secret = env('SECRET_KEY')
// Error: Environment variable 'SECRET_KEY' is not public
```

## Two Approaches

### Script Approach (Recommended)

Uses a `<script>` tag to set a global `window.__ENV` object:

```tsx
// app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'
;<head>
    <PublicEnvScript />
</head>

// Any client code
import { env } from 'next-dynenv'
const apiUrl = env('NEXT_PUBLIC_API_URL')
```

**Pros:**

- Works outside React (vanilla JS, other frameworks)
- Simpler setup
- Better Sentry compatibility

### Context Approach

Uses React Context to pass environment values:

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'
;<body>
    <PublicEnvProvider>{children}</PublicEnvProvider>
</body>

// In client components
import { useEnvContext } from 'next-dynenv'
const { NEXT_PUBLIC_API_URL } = useEnvContext()
```

**Pros:**

- Pure React pattern
- Type-safe with TypeScript
- No global pollution

## Isomorphic Access

The `env()` function works on both server and client:

```tsx
import { env } from 'next-dynenv'

// Server: reads from process.env
// Client: reads from window.__ENV (if NEXT_PUBLIC_*)

const apiUrl = env('NEXT_PUBLIC_API_URL')
```

This lets you write code once that works in both contexts.

## Next Steps

- [Script Approach](/guide/script-approach) - Detailed script setup
- [Context Approach](/guide/context-approach) - React Context setup
- [Docker Deployment](/guide/docker) - Container deployment patterns
