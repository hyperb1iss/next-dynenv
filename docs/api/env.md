# env()

Read an environment variable from a server component, route handler, proxy, or client component, with an optional
default.

## Import

```ts
import { env } from 'next-dynenv'
```

## Signature

```ts
function env(key: string): string | undefined
function env<T extends string>(key: string, defaultValue: T): string
```

## Parameters

| Parameter      | Type     | Description                                                                   |
| -------------- | -------- | ----------------------------------------------------------------------------- |
| `key`          | `string` | Variable name. In the browser it must start with `NEXT_PUBLIC_`.              |
| `defaultValue` | `string` | Optional. Returned when the variable is `undefined`. Narrows the return type. |

## Returns

The variable's value, or `defaultValue`, or `undefined`. The default only replaces `undefined`: a variable set to an
empty string returns `''`.

## Throws

In the browser, once `window.__ENV` exists, any key without the `NEXT_PUBLIC_` prefix throws:

```text
Environment variable 'API_SECRET_KEY' is not public and cannot be accessed in the browser.
To fix this:
  1. Rename to 'NEXT_PUBLIC_API_SECRET_KEY' if it should be public, or
  2. Use makeEnvPublic('API_SECRET_KEY') in instrumentation.ts, or
  3. Access from a server component or API route instead
```

For option 2, call [`makeEnvPublic()`](/api/make-env-public) from `instrumentation.ts`, which works in every output
mode.

## Where it reads from

| Context                                                                                    | Source                                    | Prefix check                        |
| ------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------------------------------- |
| Server components, route handlers, server actions, `proxy.ts`, `instrumentation.ts`        | `process.env`                             | None                                |
| Client components while they render on the server (SSR)                                    | `process.env`                             | None                                |
| Browser, with [`PublicEnvScript`](/api/components#publicenvscript) or `EnvScript` rendered | `window.__ENV`                            | Keys must start with `NEXT_PUBLIC_` |
| Browser, without either script                                                             | `process.env`, which holds nothing useful | None, returns the default           |

Two rows deserve a second look:

- **SSR of client components.** A `'use client'` component renders on the server first, where `env('API_SECRET_KEY')`
  returns the real secret and writes it into the HTML before the browser check ever runs. Only pass `NEXT_PUBLIC_` keys
  to `env()` inside client components.
- **No script.** The context approach does not set `window.__ENV`, so `env()` in the browser returns `undefined` or the
  default. Read values there with [`useEnvContext()`](/api/components#useenvcontext).

## Examples

### Client component

```tsx
'use client'

import { env } from 'next-dynenv'

export function ApiBadge() {
    const apiUrl = env('NEXT_PUBLIC_API_URL', 'http://localhost:8080')

    return <span>API: {apiUrl}</span>
}
```

### Server component

```tsx
// app/status/page.tsx
import { env } from 'next-dynenv'

export default async function StatusPage() {
    const res = await fetch(`${env('NEXT_PUBLIC_API_URL')}/status`, {
        headers: { Authorization: `Bearer ${env('API_SECRET_KEY')}` },
    })
    const status: { ok: boolean } = await res.json()

    return <p>Upstream is {status.ok ? 'up' : 'down'}</p>
}
```

### Route handler

```ts
// app/api/config/route.ts
import { env } from 'next-dynenv'

export function GET() {
    return Response.json({
        apiUrl: env('NEXT_PUBLIC_API_URL'),
        appName: env('NEXT_PUBLIC_APP_NAME', 'My App'),
    })
}
```

### Proxy

```ts
// proxy.ts (Next.js 16). On Next.js 15, use middleware.ts and export `middleware`.
import { env } from 'next-dynenv'
import { type NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
    if (env('MAINTENANCE_MODE') === 'true') {
        return NextResponse.rewrite(new URL('/maintenance', request.url))
    }

    return NextResponse.next()
}
```

### Type narrowing

```ts
const maybeUrl = env('NEXT_PUBLIC_API_URL') // string | undefined
const apiUrl = env('NEXT_PUBLIC_API_URL', 'https://api.example.com') // string
```

## Related

- [`requireEnv()`](/api/require-env) throws instead of returning `undefined`
- [`envParsers`](/api/parsers) turns the string into a boolean, number, list, URL, or object
- [`serverOnly()`](/api/server-only) reads secrets from code shared with the browser
- [How it works](/guide/how-it-works) covers when values are read
