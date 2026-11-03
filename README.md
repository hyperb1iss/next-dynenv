<div align="center">

# next-dynenv

**Runtime environment variables for Next.js. Build once, deploy anywhere.**

[![Next.js](https://img.shields.io/badge/Next.js-15%20%7C%2016-e135ff?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-80ffea?style=for-the-badge&logo=react&logoColor=12101a)](https://react.dev/)
[![npm](https://img.shields.io/npm/v/next-dynenv?style=for-the-badge&logo=npm&logoColor=12101a&color=ff6ac1)](https://www.npmjs.com/package/next-dynenv)
[![CI](https://img.shields.io/github/actions/workflow/status/hyperb1iss/next-dynenv/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/hyperb1iss/next-dynenv/actions)
[![License](https://img.shields.io/badge/License-MIT-e135ff?style=for-the-badge)](LICENSE.md)

[Documentation](https://hyperb1iss.github.io/next-dynenv/) • [Quick start](#quick-start) • [API](#api) •
[Examples](#examples)

</div>

Next.js bakes `NEXT_PUBLIC_*` values into your JavaScript at build time, so every environment needs its own build.
next-dynenv reads them when the request arrives instead. One build runs in staging and production with different config,
and changing a value takes a restart, not a rebuild.

- **One function everywhere.** `env()` reads `process.env` on the server and `window.__ENV` in the browser.
- **Typed parsers.** Booleans, numbers, lists, JSON, URLs, and enums, with clear errors when a value is wrong.
- **Safe defaults.** Only `NEXT_PUBLIC_*` variables reach the browser, escaped against script injection and frozen.
- **Script or context.** Read values through a global or through React Context.

A maintained fork of [next-runtime-env](https://github.com/expatfile/next-runtime-env) for Next.js 15 and 16.

## Install

```bash
npm install next-dynenv
```

Requires Next.js 15 or 16 with the App Router, React 19, and Node.js 20.9 or newer. pnpm, yarn, and bun work the same
way.

## Quick start

Render the script in your root layout:

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

Read public values in client components:

```tsx
'use client'

import { env } from 'next-dynenv'

export function ApiStatus() {
    return <p>Talking to {env('NEXT_PUBLIC_API_URL')}</p>
}
```

Read anything on the server:

```tsx
// app/dashboard/page.tsx
import { requireEnv } from 'next-dynenv'

export default async function DashboardPage() {
    const res = await fetch(`${requireEnv('NEXT_PUBLIC_API_URL')}/stats`, {
        headers: { Authorization: `Bearer ${requireEnv('API_SECRET_KEY')}` },
    })
    const stats: { users: number } = await res.json()

    return <h1>{stats.users} users</h1>
}
```

Build once, run anywhere:

```bash
npm run build
NEXT_PUBLIC_API_URL=https://staging.example.com npm start
NEXT_PUBLIC_API_URL=https://api.example.com npm start
```

`PublicEnvScript` opts the routes under it into dynamic rendering, because runtime values need a runtime render. See
[how it works](https://hyperb1iss.github.io/next-dynenv/guide/how-it-works.html).

## Script or context

|                         | Script approach                     | Context approach                               |
| ----------------------- | ----------------------------------- | ---------------------------------------------- |
| Server component        | `<PublicEnvScript />` in `<head>`   | `<PublicEnvProvider>` around `children`        |
| Client read             | `env('NEXT_PUBLIC_API_URL')`        | `useEnvContext().NEXT_PUBLIC_API_URL`          |
| Works outside React     | Yes                                 | No                                             |
| `envParsers` in browser | Yes                                 | No                                             |
| Best for                | Most apps, SDK setup, plain modules | Apps where every consumer is a React component |

Start with the script approach. Both read the same `NEXT_PUBLIC_*` variables, and you can render both.

## API

| Export                                                                                                | Runs on          | What it does                                                        |
| ----------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------- |
| [`env(key, default?)`](https://hyperb1iss.github.io/next-dynenv/api/env.html)                         | Server, browser  | Read a variable. Throws in the browser for keys without the prefix. |
| [`requireEnv(key)`](https://hyperb1iss.github.io/next-dynenv/api/require-env.html)                    | Server, browser  | Same, but throws when the variable is undefined.                    |
| [`serverOnly(key, fallback?)`](https://hyperb1iss.github.io/next-dynenv/api/server-only.html)         | Server, browser  | Real value on the server, fallback in the browser. Never throws.    |
| [`envParsers`](https://hyperb1iss.github.io/next-dynenv/api/parsers.html)                             | Server, browser  | `boolean`, `number`, `array`, `json`, `url`, and `enum` parsers.    |
| [`makeEnvPublic(keys)`](https://hyperb1iss.github.io/next-dynenv/api/make-env-public.html)            | Server           | Copy `API_URL` to `NEXT_PUBLIC_API_URL` at startup.                 |
| [`PublicEnvScript`](https://hyperb1iss.github.io/next-dynenv/api/components.html#publicenvscript)     | Server component | Send all `NEXT_PUBLIC_*` variables as `window.__ENV`.               |
| [`EnvScript`](https://hyperb1iss.github.io/next-dynenv/api/components.html#envscript)                 | Server component | Send an object you choose as `window.__ENV`.                        |
| [`PublicEnvProvider`](https://hyperb1iss.github.io/next-dynenv/api/components.html#publicenvprovider) | Server component | Provide all `NEXT_PUBLIC_*` variables through React Context.        |
| [`EnvProvider`](https://hyperb1iss.github.io/next-dynenv/api/components.html#envprovider)             | Client component | Provide an object you choose through React Context.                 |
| [`useEnvContext()`](https://hyperb1iss.github.io/next-dynenv/api/components.html#useenvcontext)       | Client hook      | Read the nearest provider's values.                                 |

Parse strings into the types you meant:

```ts
import { envParsers } from 'next-dynenv'

const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG') // 'true', '1', 'yes', 'on' → true
const pageSize = envParsers.number('NEXT_PUBLIC_PAGE_SIZE', 20)
const features = envParsers.array('NEXT_PUBLIC_FEATURES') // 'auth, billing' → ['auth', 'billing']
const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const tier = envParsers.enum('NEXT_PUBLIC_TIER', ['free', 'pro', 'team'] as const, 'free')
```

Expose variables your platform names without the prefix, once per server start:

```ts
// instrumentation.ts
import { makeEnvPublic } from 'next-dynenv'

export function register() {
    makeEnvPublic(['API_URL', 'APP_NAME']) // now also NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_NAME
}
```

Call it in `register()`, not `next.config`: standalone builds (`output: 'standalone'`) never evaluate `next.config` at
runtime.

## Security

- Only `NEXT_PUBLIC_*` variables are sent to the browser, as escaped JSON in a frozen object.
- Client components also render on the server, where `env()` returns real secrets into the HTML. Inside `'use client'`
  files, only read `NEXT_PUBLIC_*` keys.
- `serverOnly()` is for shared config and getters. Never render its result in a client component.
- Everything you make public is in the page source, whichever approach you use.
- With a nonce-based CSP, pass the nonce: `<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />`.

Read the [security guide](https://hyperb1iss.github.io/next-dynenv/guide/security.html) before exposing anything new.

## Deploying

Build the image once and pass config when the container starts:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  -e API_SECRET_KEY=... \
  my-app
```

Guides for [Docker and Kubernetes](https://hyperb1iss.github.io/next-dynenv/guide/docker.html),
[Vercel](https://hyperb1iss.github.io/next-dynenv/guide/vercel.html), and
[other platforms](https://hyperb1iss.github.io/next-dynenv/guide/other-platforms.html).

## Examples

| Example                                                       | Shows                                                                      |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`with-app-router-script`](examples/with-app-router-script)   | `PublicEnvScript`, `env()`, a CSP nonce from `proxy.ts`, `makeEnvPublic()` |
| [`with-app-router-context`](examples/with-app-router-context) | `PublicEnvProvider`, `useEnvContext()`, `makeEnvPublic()`                  |

Run one from the repository root:

```bash
pnpm install && pnpm build
pnpm --filter example-app-router-script dev
```

## Contributing

Pull requests are welcome. The repository uses pnpm (the version is pinned in `package.json`).

```bash
pnpm install
pnpm build              # compile the library
pnpm lint               # Biome and Prettier
pnpm typecheck
pnpm test               # unit tests
pnpm test:integration   # build a real Next.js app once, boot it with new values
pnpm --filter next-dynenv-docs dev   # docs site
```

Issues are disabled on this repository, so a pull request with a failing test or a fix is the way to report a bug.

## Releases

Release notes live on [GitHub Releases](https://github.com/hyperb1iss/next-dynenv/releases). See the
[changelog](CHANGELOG.md) for the 4.x story and the move from next-runtime-env.

| Package              | Next.js                               |
| -------------------- | ------------------------------------- |
| `next-dynenv@4`      | 15 and 16 (App Router)                |
| `next-runtime-env@3` | 14 (unmaintained)                     |
| `next-runtime-env@2` | 13 App Router (unmaintained)          |
| `next-runtime-env@1` | 12 and 13 Pages Router (unmaintained) |

## Credits

- [next-runtime-env](https://github.com/expatfile/next-runtime-env) by [Expatfile.tax](https://expatfile.tax), the
  original implementation this fork builds on.
- [react-env](https://github.com/andrewmclagan/react-env), which inspired it.
- [@andonirdgz](https://github.com/andonirdgz) for the context provider idea.

Maintained by [Stefanie Jane](https://github.com/hyperb1iss). Released under the [MIT License](LICENSE.md).

<div align="center">

If next-dynenv saves you a rebuild, [buy me a Monster Ultra Violet](https://ko-fi.com/hyperb1iss) 💜

</div>
