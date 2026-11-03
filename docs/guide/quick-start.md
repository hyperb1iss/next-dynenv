# Quick start

Five steps from install to a build that picks up new values on restart.

## 1. Render the script

Add `PublicEnvScript` to the `<head>` of your root layout:

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

On every request it reads all `NEXT_PUBLIC_*` variables from `process.env` and sends them to the browser as
`window.__ENV`.

## 2. Read values in client components

```tsx
// app/api-status.tsx
'use client'

import { env } from 'next-dynenv'

export function ApiStatus() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const appName = env('NEXT_PUBLIC_APP_NAME', 'My App')

    return (
        <p>
            {appName} is talking to {apiUrl}
        </p>
    )
}
```

In client components, only ask for `NEXT_PUBLIC_*` keys. In the browser, any other key throws. Client components also
render on the server, where `env()` would happily return a secret into the HTML, so the rule is simple: secrets never
appear in a `'use client'` file. [Security](/guide/security#client-components-render-on-the-server-too) explains why.

## 3. Read values on the server

Server components, route handlers, and proxy can read every variable:

```tsx
// app/dashboard/page.tsx
import { env, requireEnv } from 'next-dynenv'

export default async function DashboardPage() {
    const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
    const apiKey = requireEnv('API_SECRET_KEY')

    const res = await fetch(`${apiUrl}/stats`, {
        headers: { Authorization: `Bearer ${apiKey}` },
    })
    const stats: { users: number } = await res.json()

    return (
        <h1>
            {stats.users} users on {env('NEXT_PUBLIC_APP_NAME', 'My App')}
        </h1>
    )
}
```

```ts
// app/api/health/route.ts
import { env } from 'next-dynenv'

export function GET() {
    return Response.json({ status: 'ok', region: env('REGION', 'local') })
}
```

```ts
// proxy.ts (Next.js 16; on Next.js 15 name it middleware.ts and export `middleware`)
import { NextResponse, type NextRequest } from 'next/server'
import { envParsers } from 'next-dynenv'

export function proxy(request: NextRequest) {
    if (envParsers.boolean('MAINTENANCE_MODE')) {
        return NextResponse.rewrite(new URL('/maintenance', request.url))
    }
    return NextResponse.next()
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|maintenance).*)'] }
```

## 4. Set the variables

Local development uses `.env.local` as usual:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=My App
API_SECRET_KEY=dev-secret
```

## 5. Build once, run anywhere

```bash
npm run build

NEXT_PUBLIC_API_URL=https://staging.example.com API_SECRET_KEY=staging-secret npm start
NEXT_PUBLIC_API_URL=https://api.example.com API_SECRET_KEY=prod-secret npm start
```

Same build, two configurations. Open the browser console and run `window.__ENV` to see what the page received.

::: tip Typed values

Environment variables are strings. [`envParsers`](/api/parsers) turns them into what you meant:

```ts
import { envParsers } from 'next-dynenv'

const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG')
const features = envParsers.array('NEXT_PUBLIC_FEATURES')
const pageSize = envParsers.number('NEXT_PUBLIC_PAGE_SIZE', 20)
```

:::

## Next steps

- [How it works](/guide/how-it-works): what the script does and what dynamic rendering costs.
- [Making variables public](/guide/making-env-public): expose `API_URL` as `NEXT_PUBLIC_API_URL` without renaming it in
  your platform.
- [Docker and Kubernetes](/guide/docker): one image for every environment.
