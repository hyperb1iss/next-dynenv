# Components

React components for injecting environment variables.

## PublicEnvScript

Server component that injects all `NEXT_PUBLIC_*` variables into the browser.

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

### Usage

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

### With CSP Nonce

```tsx
// Direct nonce
<PublicEnvScript nonce="random-nonce-value" />

// From headers
<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
```

### Sentry Compatibility

```tsx
// Use regular script for Sentry initialization timing
<PublicEnvScript disableNextScript={true} />
```

---

## EnvScript

Low-level component for injecting custom environment variables.

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

### Usage

```tsx
import { EnvScript } from 'next-dynenv'

export default function Layout({ children }) {
    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL,
        NEXT_PUBLIC_APP_NAME: process.env.APP_NAME,
        NEXT_PUBLIC_BUILD_ID: process.env.BUILD_ID,
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

---

## PublicEnvProvider

Server component that provides public variables via React Context.

### Import

```tsx
import { PublicEnvProvider } from 'next-dynenv'
```

### Props

| Prop       | Type        | Description      |
| ---------- | ----------- | ---------------- |
| `children` | `ReactNode` | Child components |

### Usage

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

### Accessing Values

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function MyComponent() {
    const env = useEnvContext()
    return <div>API: {env.NEXT_PUBLIC_API_URL}</div>
}
```

---

## EnvProvider

Client component for providing custom environment variables via Context.

### Import

```tsx
import { EnvProvider } from 'next-dynenv'
```

### Props

| Prop       | Type                                  | Description                      |
| ---------- | ------------------------------------- | -------------------------------- |
| `env`      | `Record<string, string \| undefined>` | Environment variables to provide |
| `children` | `ReactNode`                           | Child components                 |

### Usage

```tsx
import { EnvProvider } from 'next-dynenv'

export async function CustomEnvWrapper({ children }) {
    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL,
        NEXT_PUBLIC_USER_TIER: await getUserTier(),
    }

    return <EnvProvider env={customEnv}>{children}</EnvProvider>
}
```

---

## useEnvContext

React hook for accessing environment variables from Context.

### Import

```tsx
import { useEnvContext } from 'next-dynenv'
```

### Returns

`Record<string, string | undefined>` - Environment variables object

### Throws

`Error` - When called outside of an `EnvProvider` or `PublicEnvProvider`

### Usage

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

---

## Comparison

| Component           | Type   | Use Case                                       |
| ------------------- | ------ | ---------------------------------------------- |
| `PublicEnvScript`   | Server | Automatic `NEXT_PUBLIC_*` injection via script |
| `EnvScript`         | Server | Custom env injection via script                |
| `PublicEnvProvider` | Server | Automatic `NEXT_PUBLIC_*` via Context          |
| `EnvProvider`       | Client | Custom env via Context                         |

### Script vs Context

| Feature             | Script Approach  | Context Approach       |
| ------------------- | ---------------- | ---------------------- |
| Works outside React | Yes              | No                     |
| Requires provider   | No               | Yes                    |
| Access method       | `env()` function | `useEnvContext()` hook |
| Sentry compatible   | With flag        | Yes                    |

## Related

- [Script Approach](/guide/script-approach) - Using PublicEnvScript
- [Context Approach](/guide/context-approach) - Using PublicEnvProvider
- [Custom Variables](/guide/custom-variables) - Using EnvScript/EnvProvider
