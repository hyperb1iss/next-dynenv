# Components

Two ways to get runtime values into client code: a script that sets `window.__ENV` (`PublicEnvScript`, `EnvScript`), or
React Context (`PublicEnvProvider`, `EnvProvider`, `useEnvContext`). Start with `PublicEnvScript` unless you have a
reason not to; the [comparison](#script-or-context) below lays out the tradeoffs.

## PublicEnvScript

Async server component. Render it in the root layout's `<head>`. On every request it reads each `NEXT_PUBLIC_*` variable
from `process.env` and writes them to a frozen `window.__ENV`, where [`env()`](/api/env) and
[`envParsers`](/api/parsers) read them.

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

### Props

| Prop                | Type                              | Default                             | Description                                                      |
| ------------------- | --------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `nonce`             | `string \| { headerKey: string }` | none                                | CSP nonce, or the request header to read it from                 |
| `disableNextScript` | `boolean`                         | `false`                             | Render a plain `<script>` instead of `next/script`               |
| `nextScriptProps`   | `ScriptProps` from `next/script`  | `{ strategy: 'beforeInteractive' }` | Extra props for `next/script`, merged over the default strategy. |

### What it renders

```text
window['__ENV'] = Object.freeze({"NEXT_PUBLIC_API_URL":"https://api.example.com"})
```

The JSON escapes `<`, `>`, `&`, and `'` as `\u003c`, `\u003e`, `\u0026`, and `\u0027`, so a value can't close the script
tag. By default the script goes through `next/script` with `strategy: 'beforeInteractive'`, which Next.js runs before
hydration.

### Rendering

The component calls `await connection()`, so every route under its layout renders per request and reads the current
environment. Static generation and ISR do not apply to those routes.

::: warning cacheComponents

With `cacheComponents` enabled, Next.js rejects `connection()` outside a `<Suspense>` boundary during prerendering. Wrap
the component in `<Suspense>`, and have server components that call `env()` `await connection()` themselves.

:::

### nonce

```tsx
// A nonce you already hold
<PublicEnvScript nonce={nonce} />

// Or read it from a request header your proxy.ts sets
<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
```

The header form calls `headers()` for you during the request. Next.js adds its CSP nonce to `next/script` output on its
own, so the prop matters most with `disableNextScript`. [Security](/guide/security#content-security-policy) has a full
`proxy.ts` that sets the header and the policy.

### disableNextScript

```tsx
<PublicEnvScript disableNextScript nonce={{ headerKey: 'x-nonce' }} />
```

A plain inline `<script>` runs while the browser parses the HTML, before any Next.js bundle. Turn this on when code in
`instrumentation-client.ts`, such as a Sentry init, reads `env()`: Next.js runs that file before `beforeInteractive`
scripts, so without this flag it sees `undefined`. Next.js does not add its nonce to a plain script, so pass `nonce`
yourself when a CSP is in place.

### nextScriptProps

```tsx
<PublicEnvScript nextScriptProps={{ id: 'runtime-env' }} />
```

The props are merged over `{ strategy: 'beforeInteractive' }`, so the strategy stays unless you override it. Keep it
`beforeInteractive`: with `afterInteractive` or `lazyOnload`, client components hydrate before `window.__ENV` exists,
`env()` returns `undefined`, and React reports a hydration mismatch. Function props such as `onLoad` cannot cross from a
server component, so only pass serializable values.

## EnvScript

The low-level version of `PublicEnvScript`: you choose the object. Same output, same props, plus a required `env`.

```tsx
// app/layout.tsx
import { EnvScript } from 'next-dynenv'
import { connection } from 'next/server'

const BROWSER_KEYS = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_NAME'] as const

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // EnvScript does not opt into dynamic rendering. Without this, values freeze at build time.
    await connection()

    const browserEnv = Object.fromEntries(BROWSER_KEYS.map((key) => [key, process.env[key]]))

    return (
        <html lang="en">
            <head>
                <EnvScript env={browserEnv} />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

### Props

| Prop                | Type                                     | Default                             | Description                                   |
| ------------------- | ---------------------------------------- | ----------------------------------- | --------------------------------------------- |
| `env`               | `{ [key: string]: string \| undefined }` | required                            | The object to write to `window.__ENV`         |
| `nonce`             | `string \| { headerKey: string }`        | none                                | As in [`PublicEnvScript`](#nonce)             |
| `disableNextScript` | `boolean`                                | `false`                             | As in [`PublicEnvScript`](#disablenextscript) |
| `nextScriptProps`   | `ScriptProps` from `next/script`         | `{ strategy: 'beforeInteractive' }` | As in [`PublicEnvScript`](#nextscriptprops)   |

### Rules for the env object

- **Call `connection()` yourself.** `EnvScript` reads nothing on its own, so the layout has to opt into per-request
  rendering.
- **Use `NEXT_PUBLIC_` keys.** `env()` refuses any other key in the browser.
- **Keep the names the server sees.** During SSR, `env('NEXT_PUBLIC_API_URL')` reads `process.env`; in the browser it
  reads `window.__ENV`. Mapping `NEXT_PUBLIC_API_URL: process.env.API_URL` makes those disagree, and client components
  hydrate with a different value than the server rendered. To expose an unprefixed variable, call
  [`makeEnvPublic()`](/api/make-env-public) in `instrumentation.ts` and allowlist the prefixed name here.
- **Everything in it is public.** It ships in the HTML of every route under the layout.
- **`undefined` values disappear.** `JSON.stringify` drops them, so `env()` returns its default for those keys.

## PublicEnvProvider

Async server component. Wraps children in React Context holding every `NEXT_PUBLIC_*` variable, read on each request.
Client components read the values with [`useEnvContext()`](#useenvcontext).

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

### Props

| Prop       | Type              | Default  | Description            |
| ---------- | ----------------- | -------- | ---------------------- |
| `children` | `React.ReactNode` | required | The tree to provide to |

### Behavior

- Calls `await connection()`, so routes under it render per request. Put it in a nested layout to scope that to one
  section of the app.
- Does not set `window.__ENV`. In the browser, `env()` and `envParsers` see nothing; read values through the hook.
- Values travel to the browser in the React Server Components payload, which is part of the HTML. They are as public as
  `PublicEnvScript` output.

## EnvProvider

Client component. Provides an object you choose through the same Context. `PublicEnvProvider` renders it for you.

```tsx
// app/(dashboard)/layout.tsx
import { EnvProvider } from 'next-dynenv'
import { connection } from 'next/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    await connection()

    return (
        <EnvProvider
            env={{
                NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
                NEXT_PUBLIC_FEATURES: process.env.NEXT_PUBLIC_FEATURES,
            }}
        >
            {children}
        </EnvProvider>
    )
}
```

### Props

| Prop       | Type                                     | Default  | Description            |
| ---------- | ---------------------------------------- | -------- | ---------------------- |
| `env`      | `{ [key: string]: string \| undefined }` | required | The object to provide  |
| `children` | `React.ReactNode`                        | required | The tree to provide to |

### Behavior

- **Opt into dynamic rendering.** Like `EnvScript`, it reads nothing itself; call `connection()` in the server component
  that builds `env`.
- **Nearest provider wins.** A nested `EnvProvider` replaces the outer values for its subtree; nothing merges. Pass the
  complete object you want there.
- **Names still matter.** `useEnvContext()` reads the same object during SSR and hydration, so it always agrees with
  itself. Keep the names that `process.env` holds anyway, so code that reads them through `env()` on the server gets the
  same answer.

## useEnvContext

Client hook. Returns the nearest provider's object.

```ts
function useEnvContext(): { [key: string]: string | undefined }
```

Throws when no provider is above it:

```text
useEnvContext must be used within a EnvProvider or PublicEnvProvider
```

```tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function ApiBadge() {
    const { NEXT_PUBLIC_API_URL } = useEnvContext()

    return <span>API: {NEXT_PUBLIC_API_URL ?? 'not configured'}</span>
}
```

Every key is `string | undefined`. For typed values, wrap the hook once and parse there:

```ts
// lib/use-public-config.ts (call from client components)
import { useEnvContext } from 'next-dynenv'

export function usePublicConfig() {
    const env = useEnvContext()

    return {
        apiUrl: env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
        debug: env.NEXT_PUBLIC_DEBUG === 'true',
        features: (env.NEXT_PUBLIC_FEATURES ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
    }
}
```

`envParsers` reads `window.__ENV`, not Context, so it cannot parse provider values.

## Script or context

|                                                                 | Script: `PublicEnvScript` and `env()`            | Context: `PublicEnvProvider` and `useEnvContext()` |
| --------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| Read in client components                                       | `env('NEXT_PUBLIC_API_URL')`                     | `useEnvContext().NEXT_PUBLIC_API_URL`              |
| Read outside React (plain modules, `instrumentation-client.ts`) | Yes (before hydration needs `disableNextScript`) | No                                                 |
| `envParsers` in the browser                                     | Yes                                              | No, parse the strings yourself                     |
| Browser prefix check                                            | Throws on non-`NEXT_PUBLIC_` keys                | Only what you provide is there                     |
| Global                                                          | Frozen `window.__ENV`                            | None                                               |
| Where values sit in the HTML                                    | Inline script                                    | React Server Components payload                    |
| Dynamic rendering                                               | Routes under the layout                          | Routes under the provider                          |

Both approaches put every exposed value in the page source. Neither is a place for secrets.

## Related

- [Script approach](/guide/script-approach) and [context approach](/guide/context-approach) guides
- [Custom variables](/guide/custom-variables) for `EnvScript` and `EnvProvider` patterns
- [Security](/guide/security) for CSP and what reaches the browser
