# Getting started 🚀

- [Getting started 🚀](#getting-started-)
    - [Using the script approach (recommend)](#using-the-script-approach-recommend)
    - [Using the context approach](#using-the-context-approach)

We recommend using the script approach, because you can use the environment variables outside the React context. If you
intend to stay withing the react context you can use the context approach.

## Using the script approach (recommend)

1. First, install the package into your project:

```bash
npm install @hyperb1iss/next-runtime-env
# or
yarn add @hyperb1iss/next-runtime-env
# or
pnpm install @hyperb1iss/next-runtime-env
```

1. Then add the script to your head in the root layout:

```tsx
// src/app/layout.tsx
import { PublicEnvScript } from '@hyperb1iss/next-runtime-env'

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

1. Finally, use `env` utility to access the runtime environment variables any where in your app:

```tsx
'use client'

import { useEffect } from 'react'
import { env } from '@hyperb1iss/next-runtime-env'

export function MyComponent() {
    const NEXT_PUBLIC_FOO = env('NEXT_PUBLIC_FOO')
    const NEXT_PUBLIC_BAZ = env('NEXT_PUBLIC_BAZ')

    useEffect(() => {
        // some api call using NEXT_PUBLIC_BAZ
    }, [NEXT_PUBLIC_BAZ])

    return <div>{NEXT_PUBLIC_FOO}</div>
}
```

That's it! You can now use the `@hyperb1iss/next-runtime-env` package to access runtime environment variables in your
Next.js app.

## Using the context approach

1. First, install the package into your project:

```bash
npm install @hyperb1iss/next-runtime-env
# or
yarn add @hyperb1iss/next-runtime-env
# or
pnpm install @hyperb1iss/next-runtime-env
```

2. Then wrap your component with RuntimeEnvProvider, for example in the root layout:

```tsx
// src/app/layout.tsx
import { PublicEnvProvider } from '@hyperb1iss/next-runtime-env'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <PublicEnvProvider>{children}</PublicEnvProvider>
            </body>
        </html>
    )
}
```

> **Note:** `PublicEnvProvider` is an async Server Component in Next.js 15+, so your layout must be `async`.

3. Finally, use `useEnvContext` hook to access the runtime environment variables in your components:

```tsx
'use client'

import { useEffect } from 'react'
import { useEnvContext } from '@hyperb1iss/next-runtime-env'

export function MyComponent() {
    const { NEXT_PUBLIC_FOO, NEXT_PUBLIC_BAZ } = useEnvContext()

    useEffect(() => {
        // some api call using NEXT_PUBLIC_BAZ
    }, [NEXT_PUBLIC_BAZ])

    return <div>{NEXT_PUBLIC_FOO}</div>
}
```

That's it! You can now use the `@hyperb1iss/next-runtime-env` package to access runtime environment variables in your
Next.js app.
