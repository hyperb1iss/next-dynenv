# Introduction

next-dynenv lets a Next.js app read its environment when it runs instead of when it builds. You build one artifact and
promote it through every environment, changing only the variables you start it with.

## The problem

Next.js inlines every `process.env.NEXT_PUBLIC_*` reference into the client bundle during `next build`. The value you
had at build time is the value every browser sees, forever:

```bash
NEXT_PUBLIC_API_URL=https://staging.example.com npm run build

# Later, in production
NEXT_PUBLIC_API_URL=https://api.example.com npm start
# The browser still calls staging. The URL is baked into the JavaScript.
```

That forces a rebuild per environment, which breaks the habits most deploy pipelines rely on:

- **Container images** should be identical in staging and production.
- **Promotion** should move a tested artifact forward, not rebuild it.
- **Config changes** should need a restart, not a CI run.

The [twelve-factor app](https://12factor.net/config) calls this separating config from code.

## The fix

next-dynenv reads `NEXT_PUBLIC_*` variables from `process.env` on each request and hands them to the browser through a
small inline script (or React Context). One function, `env()`, reads the right source wherever it runs:

| Where the code runs                      | `env()` reads                                  |
| ---------------------------------------- | ---------------------------------------------- |
| Server components, route handlers, proxy | `process.env`, every variable                  |
| Client components in the browser         | `window.__ENV`, only `NEXT_PUBLIC_*` variables |

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

```tsx
// app/api-status.tsx
'use client'

import { env } from 'next-dynenv'

export function ApiStatus() {
    return <p>Talking to {env('NEXT_PUBLIC_API_URL')}</p>
}
```

Restart the server with a new `NEXT_PUBLIC_API_URL` and the next page load uses it. No rebuild.

## What you get

- **[`env()`](/api/env)** and **[`requireEnv()`](/api/require-env)** for reading values on either side.
- **[`envParsers`](/api/parsers)** for booleans, numbers, lists, JSON, URLs, and enums.
- **[`serverOnly()`](/api/server-only)** for shared config modules that also need server secrets.
- **[`makeEnvPublic()`](/api/make-env-public)** for exposing variables your platform already names without the prefix.
- **Two delivery modes**: the [script approach](/guide/script-approach) (`window.__ENV`) and the
  [context approach](/guide/context-approach) (React Context).

## The trade-off

Runtime values mean runtime rendering. `PublicEnvScript` and `PublicEnvProvider` opt the routes under them into dynamic
rendering, so Next.js renders those pages per request instead of serving prerendered HTML.
[How it works](/guide/how-it-works#dynamic-rendering) covers the details.

## Next steps

- [Installation](/guide/installation): requirements and setup.
- [Quick start](/guide/quick-start): a working app in a few minutes.
- [How it works](/guide/how-it-works): the mechanism, start to finish.
