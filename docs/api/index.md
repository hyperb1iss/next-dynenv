# API Reference

The complete API surface for `next-dynenv`. Everything you need to work with runtime environment variables in Next.js.

## Core Functions

These functions provide isomorphic (server/client) access to environment variables.

### env()

Access environment variables with optional defaults. Works everywhere: server components, client components, API routes,
middleware.

```tsx
import { env } from 'next-dynenv'

// Basic usage
const apiUrl = env('NEXT_PUBLIC_API_URL')

// With default value
const timeout = env('NEXT_PUBLIC_TIMEOUT', '5000')
```

::: tip Why env()? Unifies server (`process.env`) and client (`window.__ENV`) access behind a single function. No more
`process.env` checks or separate imports. :::

[Full `env()` documentation →](/api/env)

### requireEnv()

Access environment variables that **must** exist. Throws immediately if undefined, giving you type-safe `string` instead
of `string | undefined`.

```tsx
import { requireEnv } from 'next-dynenv'

// Throws if undefined
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
// Error: "Required environment variable 'NEXT_PUBLIC_API_URL' is not defined."
```

::: tip When to use requireEnv() Use for critical configuration that your app can't function without. Fail fast at
startup rather than runtime. :::

[Full `requireEnv()` documentation →](/api/require-env)

## Type-Safe Parsers

Environment variables are always strings. These parsers convert them to typed values with validation and sensible
defaults.

### envParsers

A collection of parsers for common data types: booleans, numbers, arrays, JSON, URLs, and enums.

```tsx
import { envParsers } from 'next-dynenv'

const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG')
const port = envParsers.number('NEXT_PUBLIC_PORT', 3000)
const features = envParsers.array('NEXT_PUBLIC_FEATURES')
const config = envParsers.json<Config>('NEXT_PUBLIC_CONFIG')
const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const appEnv = envParsers.enum('NEXT_PUBLIC_ENV', ['dev', 'staging', 'prod'])
```

::: tip Type safety All parsers validate at runtime and throw helpful errors for invalid values. Use TypeScript generics
for compile-time safety too. :::

[Full `envParsers` documentation →](/api/parsers)

## Components

React components for injecting environment variables into the browser. Choose between script injection (lightweight) or
React Context (composable).

### PublicEnvScript

Injects all `NEXT_PUBLIC_*` variables into the browser via a script tag. Lightweight and works outside React.

```tsx
import { PublicEnvScript } from 'next-dynenv'

// In app/layout.tsx
export default function RootLayout({ children }) {
    return (
        <html>
            <head>
                <PublicEnvScript />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

### EnvScript

Inject custom environment variables (not just `NEXT_PUBLIC_*`) via script tag.

```tsx
import { EnvScript } from 'next-dynenv'

export default function RootLayout({ children }) {
    return (
        <html>
            <head>
                <EnvScript
                    env={{
                        NEXT_PUBLIC_API: process.env.API_URL, // Rename
                        NEXT_PUBLIC_BUILD: process.env.BUILD_ID, // Custom
                    }}
                />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

### PublicEnvProvider / EnvProvider

React Context approach for environment variables. Use when you prefer React's composition patterns.

```tsx
import { PublicEnvProvider, useEnvContext } from 'next-dynenv'

// Provider in layout
export default function RootLayout({ children }) {
    return <PublicEnvProvider>{children}</PublicEnvProvider>
}

// Consumer in component
;('use client')
export function ApiClient() {
    const { NEXT_PUBLIC_API_URL } = useEnvContext()
    return <div>API: {NEXT_PUBLIC_API_URL}</div>
}
```

::: tip Script vs Context **Script approach**: Lightweight, works outside React, compatible with Sentry **Context
approach**: React-native, composable, requires Provider wrapper :::

[Full Components documentation →](/api/components)

## Utilities

Helper functions for advanced use cases.

### makeEnvPublic()

Make non-prefixed variables available as `NEXT_PUBLIC_*`. Useful when working with hosting platforms that don't let you
customize variable names.

```tsx
// next.config.js
const { makeEnvPublic } = require('next-dynenv')

makeEnvPublic('API_URL')
// process.env.API_URL is now available as process.env.NEXT_PUBLIC_API_URL
```

::: warning Build-time only `makeEnvPublic()` runs during Next.js build. Runtime changes won't work. :::

## Quick Reference

| Function             | Purpose                    | Returns               | Throws     |
| -------------------- | -------------------------- | --------------------- | ---------- |
| `env(key)`           | Optional access            | `string \| undefined` | Never      |
| `env(key, default)`  | Optional with default      | `string`              | Never      |
| `requireEnv(key)`    | Required access            | `string`              | If missing |
| `envParsers.boolean` | Parse boolean              | `boolean`             | Never      |
| `envParsers.number`  | Parse number               | `number`              | If invalid |
| `envParsers.array`   | Parse comma-separated list | `string[]`            | Never      |
| `envParsers.json`    | Parse JSON                 | `T`                   | If invalid |
| `envParsers.url`     | Parse & validate URL       | `string`              | If invalid |
| `envParsers.enum`    | Parse enum value           | `T`                   | If invalid |

## Component Reference

| Component           | Type   | Purpose                              | Requires        |
| ------------------- | ------ | ------------------------------------ | --------------- |
| `PublicEnvScript`   | Server | Auto-inject `NEXT_PUBLIC_*`          | None            |
| `EnvScript`         | Server | Inject custom variables              | `env` prop      |
| `PublicEnvProvider` | Server | Provide `NEXT_PUBLIC_*` via Context  | None            |
| `EnvProvider`       | Client | Provide custom variables via Context | `env` prop      |
| `useEnvContext()`   | Hook   | Access Context variables             | Provider parent |
