# Script Approach

The recommended way to use next-dynenv: simple, powerful, and compatible with everything.

## Overview

The script approach injects a `<script>` tag that sets `window.__ENV` with your environment variables. This is the
recommended approach for most applications because it works everywhere—inside React, outside React, with vanilla JS,
with third-party tools like Sentry.

## Basic Setup

Add `PublicEnvScript` to your root layout:

```tsx
// app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

## Using Environment Variables

### In Client Components

```tsx
'use client'

import { env } from 'next-dynenv'

export function ApiStatus() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const debug = env('NEXT_PUBLIC_DEBUG', 'false')

    return (
        <div>
            <p>API: {apiUrl}</p>
            <p>Debug: {debug}</p>
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
    const secretKey = env('SECRET_API_KEY')

    return <div>API URL: {apiUrl}</div>
}
```

### In Vanilla JavaScript

Since values live on `window.__ENV`, you can access them outside React:

```js
// Any JavaScript file (even non-React code)
const apiUrl = window.__ENV?.NEXT_PUBLIC_API_URL

// Or import the env function
import { env } from 'next-dynenv'
const apiUrl = env('NEXT_PUBLIC_API_URL')
```

::: tip Works Everywhere This is why the script approach is recommended—it works with any JavaScript code, not just
React components. :::

## Component Props

### `nonce`

For Content Security Policy compliance, pass a nonce:

```tsx
// Direct nonce value
<PublicEnvScript nonce="random-nonce-value" />

// Or fetch from headers automatically
<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
```

### `disableNextScript`

Use a regular `<script>` tag instead of Next.js `<Script>`:

```tsx
// Use when timing matters (e.g., Sentry integration)
<PublicEnvScript disableNextScript={true} />
```

::: info When to Use This Some tools (like Sentry) need environment variables available before Next.js `<Script>`
components run. Set `disableNextScript={true}` to use a blocking `<script>` tag instead. :::

### `nextScriptProps`

Pass additional props to the Next.js `<Script>` component:

```tsx
<PublicEnvScript
    nextScriptProps={{
        strategy: 'afterInteractive',
        onLoad: () => console.log('Env loaded'),
    }}
/>
```

## CSP Configuration

### Option 1: Allow Inline Scripts

```js
// next.config.js
const cspHeader = `
  script-src 'self' 'unsafe-inline';
`
```

### Option 2: Use Nonce (Recommended)

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

Or configure automatic nonce retrieval:

```tsx
<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
```

## Custom Variables with EnvScript

For more control, use `EnvScript` directly:

```tsx
import { EnvScript } from 'next-dynenv'

export default function Layout({ children }) {
    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL,
        NEXT_PUBLIC_APP_NAME: process.env.APP_NAME,
        NEXT_PUBLIC_BUILD_ID: process.env.BUILD_ID || 'development',
    }

    return (
        <html>
            <head>
                <EnvScript env={customEnv} />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

## Sentry Integration

When using Sentry, the Next.js `<Script>` component timing can cause issues. Use `disableNextScript`:

```tsx
// app/layout.tsx
<head>
    <PublicEnvScript disableNextScript={true} />
</head>
```

```ts
// sentry.client.config.ts
import { env } from 'next-dynenv'

Sentry.init({
    dsn: env('NEXT_PUBLIC_SENTRY_DSN'),
    environment: env('NEXT_PUBLIC_ENV', 'development'),
})
```

## When to Use Script Approach

Use the script approach when:

- **Default choice** - It's the recommended approach for most apps
- **Third-party tools** - Integrating with Sentry, analytics, or other libraries
- **Non-React code** - You have vanilla JavaScript that needs environment access
- **Simplicity** - You want one import that works everywhere

## Next Steps

- [Context Approach](/guide/context-approach) - Alternative React Context setup
- [Custom Variables](/guide/custom-variables) - Fine-grained control
- [Security](/guide/security) - Security best practices
