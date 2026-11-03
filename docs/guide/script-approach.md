# Script approach

The default way to use next-dynenv. A server component writes your public variables into `window.__ENV`, and `env()`
reads them from any browser code: client components, plain modules, third-party SDK setup.

## Setup

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

`PublicEnvScript` sends every `NEXT_PUBLIC_*` variable in `process.env`. To send a hand-picked set instead, use
[`EnvScript`](/guide/custom-variables).

## Reading values

### Client components

```tsx
'use client'

import { env, envParsers } from 'next-dynenv'

export function Checkout() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const showBeta = envParsers.boolean('NEXT_PUBLIC_DEBUG')

    return (
        <form action={`${apiUrl}/checkout`}>
            {showBeta && <p>Debug mode</p>}
            <button type="submit">Pay</button>
        </form>
    )
}
```

### Plain modules

Anything that runs in the browser after the script can call `env()`. Read inside a function, not at module top level, so
the value is looked up when it's needed:

```ts
// lib/api.ts
import { requireEnv } from 'next-dynenv'

export async function fetchJson<T>(path: string): Promise<T> {
    const res = await fetch(`${requireEnv('NEXT_PUBLIC_API_URL')}${path}`)
    return res.json() as Promise<T>
}
```

### Server code

Server components, route handlers, and proxy read `process.env` directly through the same `env()` call. See the
[quick start](/guide/quick-start#_3-read-values-on-the-server).

## Props

| Prop                | Type                              | Default                             |
| ------------------- | --------------------------------- | ----------------------------------- |
| `nonce`             | `string \| { headerKey: string }` | none                                |
| `disableNextScript` | `boolean`                         | `false`                             |
| `nextScriptProps`   | `ScriptProps` from `next/script`  | `{ strategy: 'beforeInteractive' }` |

Full details live in the [components reference](/api/components#publicenvscript).

## Loading order

With the defaults, Next.js runs the script before hydration. Every client component sees `window.__ENV` on its first
render.

Two kinds of code run earlier than that:

- `instrumentation-client.ts`, which Next.js runs before it processes `beforeInteractive` scripts.
- Third-party snippets that initialize from `<head>`.

If either reads `env()`, render a plain inline script. The browser runs it while it parses `<head>`, before any bundle
loads:

```tsx
// app/layout.tsx
<head>
    <PublicEnvScript disableNextScript />
</head>
```

```ts
// instrumentation-client.ts
import * as Sentry from '@sentry/nextjs'
import { env } from 'next-dynenv'

Sentry.init({
    dsn: env('NEXT_PUBLIC_SENTRY_DSN'),
    environment: env('NEXT_PUBLIC_APP_ENV', 'development'),
})
```

::: warning Leave the strategy alone

`nextScriptProps` is merged over the default `strategy: 'beforeInteractive'`, so passing `{ id: 'env' }` keeps it. Don't
override it with `afterInteractive` or `lazyOnload`: client components would hydrate before `window.__ENV` exists and
React would report a hydration mismatch.

:::

## Content Security Policy

A strict CSP blocks inline scripts unless they carry the request's nonce. Generate the nonce in proxy, as the
[Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy) shows, and forward it as a request
header:

```ts
// proxy.ts (Next.js 16; middleware.ts on Next.js 15)
import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const csp = `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'self';`

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', csp)

    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set('Content-Security-Policy', csp)
    return response
}
```

Then point `PublicEnvScript` at the header. It reads it with `await headers()` on each request:

```tsx
<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
```

Passing a string works too, if you already have the nonce in hand:

```tsx
// app/layout.tsx
import { headers } from 'next/headers'
import { PublicEnvScript } from 'next-dynenv'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const nonce = (await headers()).get('x-nonce') ?? undefined

    return (
        <html lang="en">
            <head>
                <PublicEnvScript nonce={nonce} />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

With the default `next/script` path, Next.js also reads the nonce from the `Content-Security-Policy` request header and
applies it to the scripts it manages. With `disableNextScript`, that automatic help is gone, so always pass `nonce`
explicitly in that mode. The [script example](/examples/app-router-script) wires all of this together.

## When to pick it

Use the script approach when:

- Client code outside React components reads config (API clients, SDK setup, analytics).
- You want `envParsers` in the browser.
- Something has to read values before hydration.
- You'd rather not thread a provider through the tree.

Otherwise, the [context approach](/guide/context-approach) is a fine alternative.

## Related

- [Custom variables](/guide/custom-variables): send a curated object with `EnvScript`.
- [Security](/guide/security): what the script protects against, and what it doesn't.
- [`env()` reference](/api/env)
