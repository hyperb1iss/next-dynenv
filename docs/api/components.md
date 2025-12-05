# Components

React components and hooks for injecting and accessing environment variables in the browser. Choose between script
injection (lightweight) or React Context (composable).

## PublicEnvScript

Server component that automatically injects all `NEXT_PUBLIC_*` variables into the browser via a script tag. The most
common and recommended approach.

### Import

```tsx
import { PublicEnvScript } from 'next-dynenv'
```

### Props

| Prop                | Type                    | Default                             | Description                                          |
| ------------------- | ----------------------- | ----------------------------------- | ---------------------------------------------------- |
| `nonce`             | `string \| NonceConfig` | -                                   | CSP nonce for the script tag                         |
| `disableNextScript` | `boolean`               | `false`                             | Use regular `<script>` instead of Next.js `<Script>` |
| `nextScriptProps`   | `ScriptProps`           | `{ strategy: 'beforeInteractive' }` | Props for Next.js Script component                   |

### Basic Usage

Add to your root layout's `<head>` section:

```tsx
// app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'

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

This injects a script that sets `window.__ENV` with all `NEXT_PUBLIC_*` variables from your environment.

::: tip Why in the head? Placing `PublicEnvScript` in `<head>` ensures environment variables are available before any
client components render. :::

### CSP Nonce Support

If you're using Content Security Policy with nonces:

```tsx
// Direct nonce string
<PublicEnvScript nonce="random-nonce-value" />

// From headers (reads from request headers)
<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
```

### Sentry and Third-Party Compatibility

For tools like Sentry that initialize before React hydration:

```tsx
// Use regular <script> instead of Next.js <Script>
// This ensures timing compatibility
<PublicEnvScript disableNextScript={true} />
```

::: warning Timing matters `disableNextScript` renders a blocking script. Only use when necessary for initialization
order.

:::

---

## EnvScript

Low-level component for injecting **custom** environment variables. Use when you need to rename variables or inject
non-`NEXT_PUBLIC_*` values into the browser.

### Import

```tsx
import { EnvScript } from 'next-dynenv'
```

### Props

| Prop                | Type                                  | Default                             | Description                                          |
| ------------------- | ------------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| `env`               | `Record<string, string \| undefined>` | **Required**                        | Environment variables to inject                      |
| `nonce`             | `string \| NonceConfig`               | -                                   | CSP nonce for the script tag                         |
| `disableNextScript` | `boolean`                             | `false`                             | Use regular `<script>` instead of Next.js `<Script>` |
| `nextScriptProps`   | `ScriptProps`                         | `{ strategy: 'beforeInteractive' }` | Props for Next.js Script component                   |

### Basic Usage

```tsx
import { EnvScript } from 'next-dynenv'

export default function RootLayout({ children }) {
    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL, // Rename API_URL
        NEXT_PUBLIC_APP_NAME: process.env.APP_NAME, // Rename APP_NAME
        NEXT_PUBLIC_BUILD_ID: process.env.BUILD_ID, // Custom variable
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

### When to Use EnvScript

Use `EnvScript` instead of `PublicEnvScript` when:

- Your hosting platform doesn't allow `NEXT_PUBLIC_*` prefixes
- You need to rename environment variables
- You want to compute or transform variables before injection
- You need dynamic, per-request environment values

::: tip Dynamic values Because `EnvScript` is a server component, you can compute values dynamically:

```tsx
<EnvScript
    env={{
        NEXT_PUBLIC_USER_TIER: await getUserTier(),
        NEXT_PUBLIC_TIMESTAMP: Date.now().toString(),
    }}
/>
```

:::

---

## PublicEnvProvider

Server component that provides all `NEXT_PUBLIC_*` variables via React Context. Alternative to the script approach—use
when you prefer React's composition patterns.

### Import

```tsx
import { PublicEnvProvider } from 'next-dynenv'
```

### Props

| Prop       | Type        | Description      |
| ---------- | ----------- | ---------------- |
| `children` | `ReactNode` | Child components |

### Basic Usage

Wrap your app in the provider:

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <PublicEnvProvider>{children}</PublicEnvProvider>
            </body>
        </html>
    )
}
```

### Accessing Values with useEnvContext

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function ApiClient() {
    const env = useEnvContext()
    return <div>API: {env.NEXT_PUBLIC_API_URL}</div>
}
```

### Destructuring

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

::: tip Context vs Script **Context approach**: React-native, requires Provider wrapper, only works in React components
**Script approach**: Lightweight, works everywhere (including outside React), no Provider needed :::

---

## EnvProvider

Client component for providing **custom** environment variables via Context. The Context equivalent of `EnvScript`.

### Import

```tsx
import { EnvProvider } from 'next-dynenv'
```

### Props

| Prop       | Type                                  | Description                      |
| ---------- | ------------------------------------- | -------------------------------- |
| `env`      | `Record<string, string \| undefined>` | Environment variables to provide |
| `children` | `ReactNode`                           | Child components                 |

### Basic Usage

```tsx
import { EnvProvider } from 'next-dynenv'

export async function CustomEnvWrapper({ children }) {
    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL, // Rename
        NEXT_PUBLIC_USER_TIER: await getUserTier(), // Dynamic
        NEXT_PUBLIC_BUILD_ID: process.env.BUILD_ID, // Custom
    }

    return <EnvProvider env={customEnv}>{children}</EnvProvider>
}
```

### Composing Multiple Providers

```tsx
import { EnvProvider } from 'next-dynenv'

export function FeatureEnvProvider({ children }) {
    const featureEnv = {
        NEXT_PUBLIC_FEATURE_A: process.env.ENABLE_A ? 'true' : 'false',
        NEXT_PUBLIC_FEATURE_B: process.env.ENABLE_B ? 'true' : 'false',
    }

    return <EnvProvider env={featureEnv}>{children}</EnvProvider>
}
```

::: warning Client component Unlike `PublicEnvProvider`, `EnvProvider` is a client component. You must pass the `env`
prop from server-side code. :::

---

## useEnvContext

React hook for accessing environment variables from Context. Use with `PublicEnvProvider` or `EnvProvider`.

### Import

```tsx
import { useEnvContext } from 'next-dynenv'
```

### Returns

`Record<string, string | undefined>` - Environment variables object

### Throws

`Error` - When called outside of an `EnvProvider` or `PublicEnvProvider`

### Basic Usage

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

### Destructuring

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

### Conditional Rendering

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'
import { envParsers } from 'next-dynenv'

export function ConditionalFeature() {
    const env = useEnvContext()
    const showBeta = envParsers.boolean('NEXT_PUBLIC_BETA_FEATURES')

    if (!showBeta) {
        return null
    }

    return <BetaFeature apiUrl={env.NEXT_PUBLIC_API_URL} />
}
```

::: warning Must use within Provider `useEnvContext()` must be called within a component tree wrapped by
`PublicEnvProvider` or `EnvProvider`. Otherwise it throws an error. :::

---

## Comparison

### Component Overview

| Component           | Type   | Scope                | Use Case                                     |
| ------------------- | ------ | -------------------- | -------------------------------------------- |
| `PublicEnvScript`   | Server | Auto `NEXT_PUBLIC_*` | Automatic injection via script (recommended) |
| `EnvScript`         | Server | Custom variables     | Custom env injection via script              |
| `PublicEnvProvider` | Server | Auto `NEXT_PUBLIC_*` | Automatic injection via Context              |
| `EnvProvider`       | Client | Custom variables     | Custom env injection via Context             |
| `useEnvContext`     | Hook   | Access Context       | Read from Provider                           |

### Script vs Context

| Feature             | Script Approach (`PublicEnvScript`)        | Context Approach (`PublicEnvProvider`) |
| ------------------- | ------------------------------------------ | -------------------------------------- |
| Works outside React | Yes (vanilla JS can access `window.__ENV`) | No (React-only)                        |
| Requires provider   | No                                         | Yes (`PublicEnvProvider` wrapper)      |
| Access method       | `env()` function                           | `useEnvContext()` hook                 |
| Bundle size         | Minimal (inline script)                    | Slightly larger (Context overhead)     |
| Sentry compatible   | Yes (with `disableNextScript`)             | Yes (no timing issues)                 |
| SSR friendly        | Yes                                        | Yes                                    |

### When to Use Which

**Use Script approach** (`PublicEnvScript` / `EnvScript`):

- Default choice for most apps
- Need variables outside React (vanilla JS, third-party scripts)
- Want minimal bundle size
- Prefer simplicity (no Provider wrapper needed)

**Use Context approach** (`PublicEnvProvider` / `EnvProvider`):

- Prefer React's composition patterns
- Need multiple providers with different scopes
- Building a library that wraps `next-dynenv`
- Want explicit Provider boundaries

::: tip Recommendation For most Next.js apps, **use the script approach** (`PublicEnvScript`). It's simpler, lighter,
and works everywhere. The Context approach is great for specific use cases but adds overhead. :::

## Related

- [Script Approach Guide](/guide/script-approach) - Using PublicEnvScript
- [Context Approach Guide](/guide/context-approach) - Using PublicEnvProvider
- [Custom Variables Guide](/guide/custom-variables) - Using EnvScript/EnvProvider
- [env() function](/api/env) - Accessing environment variables
