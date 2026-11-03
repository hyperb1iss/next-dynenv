# Custom variables

`PublicEnvScript` and `PublicEnvProvider` send every `NEXT_PUBLIC_*` variable. When you want a smaller set, or values
computed per request, hand your own object to `EnvScript` or `EnvProvider`.

## Send an allowlist

```tsx
// app/layout.tsx
import { connection } from 'next/server'
import { EnvScript } from 'next-dynenv'

const BROWSER_KEYS = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_NAME', 'NEXT_PUBLIC_FEATURES']

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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

The context version is the same object passed to `EnvProvider`:

```tsx
<EnvProvider env={browserEnv}>{children}</EnvProvider>
```

## Three rules

### Call `connection()` first

`EnvScript` and `EnvProvider` render the object you give them and do nothing else. If that object comes from
`process.env` and nothing else on the route is dynamic, Next.js can prerender the layout at build time and freeze the
values. `await connection()` before reading `process.env` keeps the route dynamic, which is what `PublicEnvScript` does
internally.

### Use the names the server sees

During server rendering, `env('NEXT_PUBLIC_API_URL')` reads `process.env.NEXT_PUBLIC_API_URL`. In the browser it reads
`window.__ENV.NEXT_PUBLIC_API_URL`. If those disagree, a client component renders one value on the server and another
during hydration, and React reports a mismatch.

So don't rename in the object:

```tsx
// Avoid: the server has API_URL, the browser gets NEXT_PUBLIC_API_URL
<EnvScript env={{ NEXT_PUBLIC_API_URL: process.env.API_URL }} />
```

To expose a variable your platform names without the prefix, copy it into `process.env` at startup with
[`makeEnvPublic()`](/guide/making-env-public). Then both sides agree on `NEXT_PUBLIC_API_URL`.

### Prefix every key

In the browser, `env()` refuses keys that don't start with `NEXT_PUBLIC_`, even when they're present in `window.__ENV`.
Keep every key prefixed so the browser and server use the same API, and so a grep for `NEXT_PUBLIC_` finds everything
that ships to clients.

## Per-request values

Because the layout is a server component, the object can depend on the request. Values that only exist per request, like
a region from a CDN header, belong in context or props rather than `env()`, since `env()` on the server reads
`process.env` and won't see them:

```tsx
// app/layout.tsx
import { headers } from 'next/headers'
import { EnvProvider } from 'next-dynenv'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const region = (await headers()).get('x-vercel-ip-country') ?? 'unknown'

    return (
        <html lang="en">
            <body>
                <EnvProvider env={{ NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, NEXT_PUBLIC_REGION: region }}>
                    {children}
                </EnvProvider>
            </body>
        </html>
    )
}
```

`headers()` already makes the route dynamic, so no separate `connection()` call is needed here. Client components read
`NEXT_PUBLIC_REGION` with `useEnvContext()`.

## Keep secrets out

Everything in these objects ends up in the page HTML. An allowlist protects you from shipping a variable you forgot
about; it does nothing for a secret you put in on purpose.

```tsx
// Never: the secret is now public
<EnvScript env={{ NEXT_PUBLIC_STRIPE_KEY: process.env.STRIPE_SECRET_KEY }} />
```

## Related

- [Making variables public](/guide/making-env-public)
- [`EnvScript` and `EnvProvider` reference](/api/components#envscript)
- [Security](/guide/security)
