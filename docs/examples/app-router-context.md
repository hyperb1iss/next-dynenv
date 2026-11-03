# App Router: context approach

The context example wraps the app in `PublicEnvProvider` and reads public values in a client component with
`useEnvContext()`. There is no script tag and no `window.__ENV`.

[View the source on GitHub](https://github.com/hyperb1iss/next-dynenv/tree/main/examples/with-app-router-context)

## Files

| File                           | What it does                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `src/app/layout.tsx`           | Wraps the page content in `<PublicEnvProvider>`                                            |
| `src/instrumentation.ts`       | Calls `makeEnvPublic('BAZ')` at server start, so `BAZ` is also served as `NEXT_PUBLIC_BAZ` |
| `src/app/client-side/page.tsx` | Client component that destructures `NEXT_PUBLIC_FOO` and `NEXT_PUBLIC_BAZ` from the hook   |
| `src/app/server-side/page.tsx` | Server component that awaits `connection()` and reads `BAR` and `BAZ` with `env()`         |
| `src/app/api/bar-baz/route.ts` | Route handler that returns `BAR` and `BAZ` as JSON                                         |
| `next.config.ts`               | Default config; nothing next-dynenv specific                                               |

## The layout

```tsx
// src/app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <main>
                    <PublicEnvProvider>{children}</PublicEnvProvider>
                </main>
            </body>
        </html>
    )
}
```

`PublicEnvProvider` is an async server component. It calls `connection()`, collects every `NEXT_PUBLIC_*` variable for
the current request, and passes them to a client-side context provider. Every route under this layout renders per
request.

## Reading values in a client component

```tsx
// src/app/client-side/page.tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export default function ClientSide() {
    const { NEXT_PUBLIC_FOO, NEXT_PUBLIC_BAZ } = useEnvContext()

    return (
        <dl>
            <dt>NEXT_PUBLIC_FOO</dt>
            <dd>{NEXT_PUBLIC_FOO ?? 'unset'}</dd>
            <dt>NEXT_PUBLIC_BAZ</dt>
            <dd>{NEXT_PUBLIC_BAZ ?? 'unset'}</dd>
        </dl>
    )
}
```

Every key is typed `string | undefined`, so keep a fallback. `useEnvContext()` throws if no provider sits above the
component.

::: warning env() does not see the context

In the browser, `env()` and `envParsers` read `window.__ENV`, which only `PublicEnvScript` or `EnvScript` create. In
this app they return `undefined` (or your default) in client components. Use the hook, or add `PublicEnvScript` if you
also need values outside React.

:::

## Run it

From the repository root:

```bash
pnpm install
pnpm build
cp examples/with-app-router-context/.env.example examples/with-app-router-context/.env.local
pnpm --filter example-app-router-context dev
```

Then open `http://localhost:3000/client-side`, `/server-side`, and `/api/bar-baz`.

## Things to try

**Build once, start twice.**

```bash
pnpm --filter example-app-router-context build
NEXT_PUBLIC_FOO=first BAR=secret BAZ=shared pnpm --filter example-app-router-context start
NEXT_PUBLIC_FOO=second BAR=rotated BAZ=moved pnpm --filter example-app-router-context start
```

**Find the values in the HTML.** View the page source and search for `NEXT_PUBLIC_FOO`. The values travel inside the
React Server Components payload instead of a script tag, so they are still public. `BAR` never appears.

**Remove the provider.** Take `PublicEnvProvider` out of the layout and `/client-side` fails with
`useEnvContext must be used within a EnvProvider or PublicEnvProvider`.

## Related

- [Context approach guide](/guide/context-approach)
- [Components API](/api/components)
- [Script approach example](/examples/app-router-script)
