# Context Approach

Alternative approach using React Context for environment access.

## Overview

The context approach uses React Context to pass environment variables through the component tree. This is a pure React
pattern without global state.

## Basic Setup

Wrap your app with `PublicEnvProvider`:

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <PublicEnvProvider>{children}</PublicEnvProvider>
            </body>
        </html>
    )
}
```

## Using Environment Variables

### With useEnvContext Hook

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function ApiClient() {
    const env = useEnvContext()

    return (
        <div>
            <p>API URL: {env.NEXT_PUBLIC_API_URL}</p>
            <p>App Name: {env.NEXT_PUBLIC_APP_NAME}</p>
        </div>
    )
}
```

### Destructuring Variables

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function FeatureFlags() {
    const { NEXT_PUBLIC_FEATURE_A, NEXT_PUBLIC_FEATURE_B } = useEnvContext()

    return (
        <div>
            {NEXT_PUBLIC_FEATURE_A === 'true' && <FeatureA />}
            {NEXT_PUBLIC_FEATURE_B === 'true' && <FeatureB />}
        </div>
    )
}
```

### With Default Values

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function Config() {
    const env = useEnvContext()

    const apiUrl = env.NEXT_PUBLIC_API_URL ?? 'https://default-api.com'
    const timeout = Number(env.NEXT_PUBLIC_TIMEOUT ?? '5000')

    return (
        <div>
            <p>API: {apiUrl}</p>
            <p>Timeout: {timeout}ms</p>
        </div>
    )
}
```

## Custom Variables with EnvProvider

For fine-grained control, use `EnvProvider` directly:

```tsx
// Server component
import { EnvProvider } from 'next-dynenv'

export async function CustomEnvWrapper({ children }) {
    // Fetch or compute custom environment
    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL,
        NEXT_PUBLIC_USER_TIER: await getUserTier(),
        NEXT_PUBLIC_REGION: process.env.REGION || 'us-east-1',
    }

    return <EnvProvider env={customEnv}>{children}</EnvProvider>
}
```

## Combining with Other Providers

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from './auth-provider'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <PublicEnvProvider>
                    <ThemeProvider>
                        <AuthProvider>{children}</AuthProvider>
                    </ThemeProvider>
                </PublicEnvProvider>
            </body>
        </html>
    )
}
```

## TypeScript Support

Create typed environment access:

```tsx
// types/env.d.ts
declare module 'next-dynenv' {
    interface ProcessEnv {
        NEXT_PUBLIC_API_URL?: string
        NEXT_PUBLIC_APP_NAME?: string
        NEXT_PUBLIC_DEBUG?: string
    }
}
```

Then use with full type safety:

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function TypedComponent() {
    const env = useEnvContext()

    // TypeScript knows these properties exist
    const apiUrl = env.NEXT_PUBLIC_API_URL

    return <div>{apiUrl}</div>
}
```

## Error Handling

The hook throws if used outside a provider:

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function SafeComponent() {
    try {
        const env = useEnvContext()
        return <div>API: {env.NEXT_PUBLIC_API_URL}</div>
    } catch (error) {
        return <div>Error: Component must be wrapped in PublicEnvProvider</div>
    }
}
```

## Comparison with Script Approach

| Feature           | Context | Script     |
| ----------------- | ------- | ---------- |
| React-only        | Yes     | No         |
| Global state      | No      | Yes        |
| Outside React     | No      | Yes        |
| Sentry compatible | Yes     | Needs flag |
| Setup complexity  | Simple  | Simple     |

## When to Use Context Approach

Use the context approach when:

- Your app is purely React
- You prefer avoiding global state
- You want to leverage React patterns
- Type safety is important

## Next Steps

- [Script Approach](/guide/script-approach) - Alternative global approach
- [Custom Variables](/guide/custom-variables) - Fine-grained control
- [API Reference](/api/components) - Component documentation
