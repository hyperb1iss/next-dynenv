# Making variables public

Your platform sets `API_URL`. The browser needs `NEXT_PUBLIC_API_URL`. `makeEnvPublic()` copies one to the other when
the server starts, so you don't have to rename anything in your deployment config.

## Call it in `register()`

Put the call in [`instrumentation.ts`](https://nextjs.org/docs/app/guides/instrumentation). Next.js runs `register()`
once when each server instance starts, before it handles requests:

```ts
// instrumentation.ts (or src/instrumentation.ts)
import { makeEnvPublic } from 'next-dynenv'

export function register() {
    makeEnvPublic(['API_URL', 'APP_NAME', 'SENTRY_DSN'])
}
```

After startup, `process.env` holds both names:

```ts
process.env.API_URL // 'https://api.example.com', unchanged
process.env.NEXT_PUBLIC_API_URL // 'https://api.example.com', the copy
```

`PublicEnvScript` and `PublicEnvProvider` read `process.env` on each request, so they pick up the copies and send them
to the browser. Server and browser agree on the name, which keeps hydration clean:

```tsx
'use client'

import { env } from 'next-dynenv'

export function ApiStatus() {
    return <p>{env('NEXT_PUBLIC_API_URL')}</p>
}
```

## Why not `next.config`

Older guides call `makeEnvPublic()` at the top of `next.config.js`. That only works with `next start`, which evaluates
the config when the server boots. A
[standalone build](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) (`output: 'standalone'`, the
usual choice for Docker) serializes the config into `server.js` at build time and never runs `next.config` again. The
call happens on the build machine and the running container never sees the copies.

`register()` runs in every output mode, so it's the one place that always works.

## Logging

Each call reports what it did. Lines go to the console with a `(next-dynenv)` suffix:

```
 ✓ Prefixed environment variable 'API_URL' (next-dynenv)
 ⚠ Skipped prefixing environment variable 'SENTRY_DSN'. Variable not in process.env (next-dynenv)
```

Pass `logLevel` to quiet it down:

| `logLevel`            | Success lines | Warnings |
| --------------------- | ------------- | -------- |
| unset (default)       | Shown         | Shown    |
| `'info'`, `'warn'`    | Hidden        | Shown    |
| `'error'`, `'silent'` | Hidden        | Hidden   |

```ts
makeEnvPublic(['API_URL', 'APP_NAME'], { logLevel: 'warn' })
```

## Behavior

- **Missing variables** (`undefined`) are skipped with a warning. Nothing throws.
- **Empty strings** are copied like any other value.
- **Keys that already start with `NEXT_PUBLIC_`** are skipped with a warning.
- **An existing `NEXT_PUBLIC_` copy is overwritten** by the unprefixed value, without a warning.
- **The original variable stays** in `process.env`, still server-only.

## Before you call it

Everything you make public ships to every visitor in the page HTML. Copy URLs, IDs, and flags. Never copy keys, tokens,
or passwords; for those, keep reading them on the server with [`env()`](/api/env).

## Related

- [`makeEnvPublic()` reference](/api/make-env-public)
- [Docker and Kubernetes](/guide/docker)
- [Custom variables](/guide/custom-variables)
