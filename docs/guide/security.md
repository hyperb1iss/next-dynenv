# Security

next-dynenv draws one line: `NEXT_PUBLIC_*` variables go to the browser, everything else stays on the server. This page
covers what holds that line for you and where you have to hold it yourself.

## What the library does

- **Sends only public variables.** `PublicEnvScript` and `PublicEnvProvider` filter `process.env` to keys that start
  with `NEXT_PUBLIC_`. Server-only variables never enter the payload.
- **Escapes the payload.** The inline script escapes `<`, `>`, `&`, and `'`, so a value such as
  `</script><script>alert(1)</script>` can't break out of the tag.
- **Freezes the result.** `window.__ENV` is wrapped in `Object.freeze`, so page scripts can't rewrite config after it
  loads.
- **Refuses secrets in the browser.** Once `window.__ENV` exists, `env()` throws for any key without the prefix:

```
Environment variable 'API_SECRET_KEY' is not public and cannot be accessed in the browser.
```

## Client components render on the server too

This is the one to remember. A `'use client'` component runs twice: once on the server to produce HTML, then again in
the browser to hydrate. On the server, `env()` reads `process.env` and can't tell it's inside a client component:

```tsx
'use client'

import { env } from 'next-dynenv'

export function Debug() {
    // On the server this returns the real secret and renders it into the HTML.
    // The browser throws afterwards, but the page source already has the value.
    return <pre>{env('API_SECRET_KEY')}</pre>
}
```

[`serverOnly()`](/api/server-only) has the same shape. It returns the real value on the server and the fallback in the
browser, so rendering its result in a client component leaks the value and causes a hydration mismatch.

The rules that follow:

- Inside client components, call `env()` with `NEXT_PUBLIC_*` keys only.
- Use `serverOnly()` in shared config and getter code, never for values a client component renders.
- Read secrets in server components, route handlers, server actions, and proxy.

## Mark secret modules as server-only

Next.js supports the [`server-only`](https://www.npmjs.com/package/server-only) package. Import it at the top of any
module that reads secrets and the build fails if a client component ever imports that module:

```ts
// lib/payments.ts
import 'server-only'

import { requireEnv } from 'next-dynenv'

export async function createCharge(amount: number) {
    const res = await fetch('https://api.payments.example.com/charges', {
        method: 'POST',
        headers: { Authorization: `Bearer ${requireEnv('PAYMENTS_SECRET_KEY')}` },
        body: JSON.stringify({ amount }),
    })
    return res.json()
}
```

## Public means public

Every value you send to the browser is in the page source. The script approach writes it into an inline script; the
context approach writes it into the React Server Component payload. Choosing context doesn't hide anything.

Before a variable gets the `NEXT_PUBLIC_` prefix, or goes through [`makeEnvPublic()`](/guide/making-env-public) or a
[custom object](/guide/custom-variables), ask whether you'd paste it into a public README. URLs, IDs, publishable keys,
and flags pass. Secret keys, tokens, and passwords don't.

## The browser check needs the script

`env()` only enforces the prefix when `window.__ENV` exists. In an app that uses only the context approach, a stray
`env('API_SECRET_KEY')` in the browser quietly returns `undefined` instead of throwing. The SSR rule above still
applies, so the fix is the same: keep non-public keys out of client components.

## Fail fast on missing config

[`requireEnv()`](/api/require-env) and the throwing [parsers](/api/parsers) turn a missing or malformed variable into a
clear error. To catch problems when the server starts instead of on the first request that needs a value, check them in
`register()`:

```ts
// instrumentation.ts
import { envParsers, requireEnv } from 'next-dynenv'

export function register() {
    requireEnv('DATABASE_URL')
    requireEnv('API_SECRET_KEY')
    envParsers.url('NEXT_PUBLIC_API_URL')
}
```

A failure surfaces as
`An error occurred while loading instrumentation hook: Required environment variable 'DATABASE_URL' is not defined.`

## Content Security Policy

With a nonce-based CSP, the inline script needs the request's nonce. Generate it in proxy and forward it in a request
header, then let `PublicEnvScript` read it:

```tsx
<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
```

The full proxy setup is in [Script approach](/guide/script-approach#content-security-policy), and the
[script example](/examples/app-router-script) runs it end to end. Two things to know:

- With the default `next/script` path, Next.js also applies the nonce it finds in the `Content-Security-Policy` request
  header. With `disableNextScript`, it doesn't, so pass `nonce` yourself.
- A nonce only exists per request, which suits next-dynenv: its routes already render per request.

Avoid `'unsafe-inline'` in `script-src`. It allows every inline script on the page, not just this one.

## Checklist

- [ ] Secrets have no `NEXT_PUBLIC_` prefix and never pass through `makeEnvPublic()` or `EnvScript`.
- [ ] Client components only call `env()` with `NEXT_PUBLIC_*` keys.
- [ ] Modules that read secrets import `server-only`.
- [ ] Required variables are checked in `register()`.
- [ ] `.env*` files stay out of version control and container images.
- [ ] With a CSP, the script carries the request nonce.
