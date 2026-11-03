# App Router: script approach

The script example renders `PublicEnvScript` in the root layout, reads public values with `env()` in a client component,
and runs a strict Content Security Policy with a per-request nonce.

[View the source on GitHub](https://github.com/hyperb1iss/next-dynenv/tree/main/examples/with-app-router-script)

## Files

| File                           | What it does                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `src/app/layout.tsx`           | Renders `PublicEnvScript` in `<head>`, with the nonce read from the `x-nonce` header         |
| `src/proxy.ts`                 | Generates a nonce per request, sets the CSP response header and the `x-nonce` request header |
| `src/instrumentation.ts`       | Calls `makeEnvPublic('BAZ')` at server start, so `BAZ` is also served as `NEXT_PUBLIC_BAZ`   |
| `src/app/client-side/page.tsx` | Client component that reads `NEXT_PUBLIC_FOO` and `NEXT_PUBLIC_BAZ` with `env()`             |
| `src/app/server-side/page.tsx` | Server component that awaits `connection()` and reads `BAR` and `BAZ` with `env()`           |
| `src/app/api/bar-baz/route.ts` | Route handler that returns `BAR` and `BAZ` as JSON                                           |
| `next.config.ts`               | Default config; nothing next-dynenv specific                                                 |

## The layout

```tsx
// src/app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                {/* x-nonce is set per request by src/proxy.ts */}
                <PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

`PublicEnvScript` collects every `NEXT_PUBLIC_*` variable at request time and writes a frozen `window.__ENV` before the
app hydrates. Because it calls `connection()`, every route under this layout renders per request.

## Reading values in a client component

```tsx
// src/app/client-side/page.tsx
'use client'

import { env } from 'next-dynenv'

export default function ClientSide() {
    return (
        <dl>
            <dt>NEXT_PUBLIC_FOO</dt>
            <dd>{env('NEXT_PUBLIC_FOO') ?? 'unset'}</dd>
            <dt>NEXT_PUBLIC_BAZ</dt>
            <dd>{env('NEXT_PUBLIC_BAZ') ?? 'unset'}</dd>
        </dl>
    )
}
```

During server rendering `env()` reads `process.env`; in the browser it reads `window.__ENV`. Both sides see the same
values, so hydration matches. Keep client components to `NEXT_PUBLIC_` keys: `env('BAR')` here would return the real
value during server rendering, writing it into the HTML, and then throw in the browser.

## The nonce flow

1. `src/proxy.ts` runs before each page request. It creates a random nonce, builds a CSP with
   `script-src 'self' 'nonce-…' 'strict-dynamic'` (plus `'unsafe-eval'` in development only), sets that policy on the
   response, and forwards the nonce to the app as an `x-nonce` request header.
2. `PublicEnvScript` gets `{ headerKey: 'x-nonce' }` as its `nonce` prop, reads the header with `headers()`, and puts
   the nonce on its script.
3. Next.js reads the nonce from the `Content-Security-Policy` header and applies it to its own scripts.

The proxy matcher skips route handlers, static assets, and prefetch requests. On Next.js 15, the same code lives in
`middleware.ts` with an exported `middleware` function.

## Run it

From the repository root:

```bash
pnpm install
pnpm build
cp examples/with-app-router-script/.env.example examples/with-app-router-script/.env.local
pnpm --filter example-app-router-script dev
```

Then open:

- `http://localhost:3000/client-side` for the client component
- `http://localhost:3000/server-side` for the server component
- `http://localhost:3000/api/bar-baz` for the route handler

## Things to try

**Build once, start twice.** Build without any values, then start the same build with different ones:

```bash
pnpm --filter example-app-router-script build
NEXT_PUBLIC_FOO=first BAR=secret BAZ=shared pnpm --filter example-app-router-script start
NEXT_PUBLIC_FOO=second BAR=rotated BAZ=moved pnpm --filter example-app-router-script start
```

**Watch `makeEnvPublic` work.** Start with `BAZ` set: `/client-side` shows its value as `NEXT_PUBLIC_BAZ`, and the
server log prints a line ending in `(next-dynenv)` when the variable is copied.

**Look at what the browser gets.** Run `window.__ENV` in the devtools console, or view the page source and search for
`__ENV`. You will find `NEXT_PUBLIC_FOO` and `NEXT_PUBLIC_BAZ`, and never `BAR`.

**Check the CSP.** The response headers carry a fresh nonce on every load, and the same nonce appears on the scripts in
the page source.

## Related

- [Script approach guide](/guide/script-approach)
- [Making env public](/guide/making-env-public)
- [Security and CSP](/guide/security)
- [Context approach example](/examples/app-router-context)
