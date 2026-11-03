---
layout: home

hero:
    name: next-dynenv
    text: Runtime environment variables for Next.js
    tagline: Build once, deploy anywhere. Change config with a restart, not a rebuild.
    actions:
        - theme: brand
          text: Get started
          link: /guide/quick-start
        - theme: alt
          text: How it works
          link: /guide/how-it-works
        - theme: alt
          text: GitHub
          link: https://github.com/hyperb1iss/next-dynenv

features:
    - icon: ◆
      title: Runtime, not build time
      details:
          Public values are read when the request arrives. Ship one image to staging and production and change config
          with a restart.
    - icon: ▲
      title: One function everywhere
      details:
          <code>env()</code> works in server components, client components, route handlers, and proxy. Same call, the
          right source.
    - icon: ●
      title: Typed parsers
      details:
          Turn strings into booleans, numbers, arrays, JSON, URLs, and enums, with clear errors when a value is wrong.
    - icon: ■
      title: Safe defaults
      details:
          Only <code>NEXT_PUBLIC_*</code> variables reach the browser. Values are escaped against script injection and
          frozen once loaded.
    - icon: ◇
      title: Script or context
      details:
          Read <code>window.__ENV</code> through <code>env()</code>, or use React Context with
          <code>useEnvContext()</code>. Pick what fits your app.
    - icon: △
      title: Next.js 15 and 16
      details:
          Built for the App Router and React 19. An integration test builds once, boots with new values, and checks both
          sides.
---

## Thirty seconds

Install the package:

```bash
npm install next-dynenv
```

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

Read values anywhere:

```tsx
'use client'

import { env } from 'next-dynenv'

export function ApiBadge() {
    return <span>{env('NEXT_PUBLIC_API_URL')}</span>
}
```

Build once, then start the same build with different values:

```bash
npm run build
NEXT_PUBLIC_API_URL=https://staging.example.com npm start
NEXT_PUBLIC_API_URL=https://api.example.com npm start
```

Next: the [quick start](/guide/quick-start) covers server components, proxy, and parsers.
