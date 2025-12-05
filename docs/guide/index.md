# Introduction

**next-dynenv** provides dynamic runtime environment variables for Next.js applications, enabling the "build once,
deploy many" philosophy.

## Why Runtime Environment Variables?

In traditional Next.js applications, environment variables are baked into the build at compile time. This means you need
separate builds for development, staging, and production environments.

With **next-dynenv**, you build once and deploy anywhere:

- **Development** → Same build, different `.env`
- **Staging** → Same build, staging environment variables
- **Production** → Same build, production environment variables

This approach is a cornerstone of:

- [Twelve-Factor App](https://12factor.net) methodology
- Continuous delivery pipelines
- Container-based deployments (Docker, Kubernetes)

## Key Features

### Isomorphic API

The `env()` function works everywhere in your Next.js app:

```tsx
import { env } from 'next-dynenv'

// Works in server components
const apiUrl = env('NEXT_PUBLIC_API_URL')

// Works in client components
const debug = env('NEXT_PUBLIC_DEBUG')

// Works in middleware
const featureFlag = env('NEXT_PUBLIC_FEATURE_FLAG')
```

### Type-Safe Parsers

Convert environment strings to proper types:

```tsx
import { envParsers } from 'next-dynenv'

const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG') // boolean
const port = envParsers.number('NEXT_PUBLIC_PORT', 3000) // number
const features = envParsers.array('NEXT_PUBLIC_FEATURES') // string[]
const config = envParsers.json<Config>('NEXT_PUBLIC_CONFIG') // typed JSON
```

### Security Built-in

- **XSS Protection**: All values are JSON-escaped before injection
- **Immutable Values**: Runtime environment is frozen with `Object.freeze()`
- **Strict Prefix Enforcement**: Only `NEXT_PUBLIC_*` variables are exposed to the browser

## Quick Example

```tsx
// app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <PublicEnvScript />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

```tsx
// app/components/ApiStatus.tsx
'use client'
import { env } from 'next-dynenv'

export function ApiStatus() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    return <div>API: {apiUrl}</div>
}
```

## Next Steps

- [Installation](/guide/installation) - Add next-dynenv to your project
- [Quick Start](/guide/quick-start) - Get up and running in 2 minutes
- [API Reference](/api/) - Full API documentation
