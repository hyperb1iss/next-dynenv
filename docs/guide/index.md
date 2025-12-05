# Introduction

**next-dynenv** brings true runtime environment variables to Next.js, enabling the "build once, deploy anywhere"
philosophy that modern deployment workflows demand.

## The Problem with Build-Time Variables

Traditional Next.js apps bake environment variables into your JavaScript bundle at build time. Want to change an API
endpoint? You need a full rebuild. Deploying to staging and production? That's two separate builds with different
configurations.

This creates friction for:

- **Docker workflows** - You want one image for all environments, not three
- **Feature flags** - Toggle features without rebuilding and redeploying
- **Multi-tenant apps** - Different configs per customer without separate builds
- **CI/CD pipelines** - Build artifacts should be environment-agnostic

## The Solution

**next-dynenv** injects environment variables at **runtime**, not build time. Build once, then deploy the same artifact
everywhere with different configurations.

::: tip Build Once, Deploy Anywhere

```bash
# Build your app once
npm run build

# Deploy the same build to different environments
docker run -e NEXT_PUBLIC_API_URL=https://staging.api my-app
docker run -e NEXT_PUBLIC_API_URL=https://prod.api my-app
```

:::

This approach aligns with:

- [Twelve-Factor App](https://12factor.net) methodology
- Modern container orchestration (Docker, Kubernetes)
- Continuous delivery best practices

## Key Features

### 🎯 Isomorphic API

One function, works everywhere:

```tsx
import { env } from 'next-dynenv'

// Server components
const apiUrl = env('NEXT_PUBLIC_API_URL')

// Client components
const debug = env('NEXT_PUBLIC_DEBUG')

// Middleware
const featureFlag = env('NEXT_PUBLIC_FEATURE_FLAG')
```

### 🔧 Type-Safe Parsers

Stop fighting with string casting:

```tsx
import { envParsers } from 'next-dynenv'

const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG') // boolean
const port = envParsers.number('NEXT_PUBLIC_PORT', 3000) // number
const features = envParsers.array('NEXT_PUBLIC_FEATURES') // string[]
const config = envParsers.json<Config>('NEXT_PUBLIC_CONFIG') // typed JSON
```

### 🔒 Security Built-in

Protected by default:

- **XSS Protection** - All values JSON-escaped before injection
- **Immutable Values** - Runtime environment frozen with `Object.freeze()`
- **Strict Prefix Enforcement** - Only `NEXT_PUBLIC_*` variables exposed to browser

## Quick Example

Add the script to your layout:

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

Use environment variables anywhere:

```tsx
// app/components/ApiStatus.tsx
'use client'
import { env } from 'next-dynenv'

export function ApiStatus() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    return <div>Connected to: {apiUrl}</div>
}
```

That's it. Change your environment variables at runtime without rebuilding.

## Next Steps

- [Installation](/guide/installation) - Add next-dynenv to your project
- [Quick Start](/guide/quick-start) - Get up and running in 2 minutes
- [API Reference](/api/) - Full API documentation
