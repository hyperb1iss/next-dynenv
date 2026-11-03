# Context approach

Deliver public variables through React Context instead of a global. A server component reads `process.env` and passes
the values to a client provider; client components read them with a hook.

## Setup

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

`PublicEnvProvider` sends every `NEXT_PUBLIC_*` variable in `process.env`, and like `PublicEnvScript` it opts the routes
under it into [dynamic rendering](/guide/how-it-works#dynamic-rendering).

## Reading values

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function ApiStatus() {
    const { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_NAME = 'My App' } = useEnvContext()

    return (
        <p>
            {NEXT_PUBLIC_APP_NAME} is talking to {NEXT_PUBLIC_API_URL}
        </p>
    )
}
```

`useEnvContext()` returns `{ [key: string]: string | undefined }` and throws if no provider sits above the component:

```
useEnvContext must be used within a EnvProvider or PublicEnvProvider
```

Server components don't need the provider. They call `env()`, which reads `process.env`.

## A typed hook

The context is an untyped dictionary. Wrap it once to get named, parsed fields:

```ts
// lib/use-app-env.ts
import { useEnvContext } from 'next-dynenv'

export function useAppEnv() {
    const env = useEnvContext()

    return {
        apiUrl: env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
        appName: env.NEXT_PUBLIC_APP_NAME ?? 'My App',
        debug: env.NEXT_PUBLIC_DEBUG === 'true',
        features: (env.NEXT_PUBLIC_FEATURES ?? '').split(',').filter(Boolean),
    }
}
```

## What context doesn't reach

The provider only feeds `useEnvContext()`. Keep these limits in mind:

- **`env()` and `envParsers` don't read context.** In the browser they look at `window.__ENV`, which only the script
  approach creates. Without it they return `undefined` or your default. Parse context values yourself, as in the typed
  hook above.
- **Non-React code can't call hooks.** API clients, SDK setup, and `instrumentation-client.ts` need the
  [script approach](/guide/script-approach).
- **Values still reach the HTML.** The provider's props travel in the React Server Component payload embedded in the
  page, so context is not a way to hide anything. Only send public values.

Need both? Render `PublicEnvScript` in `<head>` and `PublicEnvProvider` around `children`. They read the same source.

## Nesting providers

`useEnvContext()` returns the nearest provider's object. An inner provider replaces the outer one for its subtree; the
two are not merged. To extend the public set for one section, pass a merged object to
[`EnvProvider`](/api/components#envprovider):

```tsx
// app/admin/layout.tsx
import { connection } from 'next/server'
import { EnvProvider } from 'next-dynenv'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await connection()

    const publicEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith('NEXT_PUBLIC_')))

    return <EnvProvider env={{ ...publicEnv, NEXT_PUBLIC_ADMIN_MODE: 'true' }}>{children}</EnvProvider>
}
```

Keys you add this way exist only in context. A server-side `env('NEXT_PUBLIC_ADMIN_MODE')` won't see them, so read them
through the hook on the client side only.

## When to pick it

Use the context approach when every consumer is a React client component and you like values flowing through the tree,
for example in a design system or a provider-heavy app. Otherwise start with the
[script approach](/guide/script-approach).

## Related

- [Custom variables](/guide/custom-variables): curated objects with `EnvProvider`.
- [Components reference](/api/components#publicenvprovider)
- [Context example](/examples/app-router-context)
