# Quick Start

Get runtime environment variables working in under 2 minutes.

## Step 1: Add the Script Component

Drop `PublicEnvScript` into your root layout:

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

::: tip What This Does This component automatically exposes all `NEXT_PUBLIC_*` environment variables to the browser at
runtime. No configuration needed. :::

## Step 2: Use Environment Variables

### In Client Components

```tsx
// app/components/ApiStatus.tsx
'use client'

import { env } from 'next-dynenv'

export function ApiStatus() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const debug = env('NEXT_PUBLIC_DEBUG_MODE', 'false')

    return (
        <div>
            <p>API: {apiUrl}</p>
            <p>Debug: {debug}</p>
        </div>
    )
}
```

### In Server Components

```tsx
// app/components/DataFetcher.tsx
import { env } from 'next-dynenv'

export default async function DataFetcher() {
    // Access both public and private variables
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const secretKey = env('SECRET_API_KEY')

    // Use secretKey for server-side API calls
    const data = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${secretKey}` },
    })

    return <div>{/* Render data */}</div>
}
```

::: warning Server-Side Only Private environment variables (without `NEXT_PUBLIC_` prefix) only work in server
components, API routes, and middleware. Attempting to access them in client components will throw an error. :::

### In Middleware

```tsx
// middleware.ts
import { env } from 'next-dynenv'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const featureEnabled = env('NEXT_PUBLIC_ENABLE_FEATURE', 'false')

    if (featureEnabled === 'true') {
        return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/coming-soon', request.url))
}
```

## Step 3: Set Environment Variables

Create `.env.local` for development:

```bash
# Public variables (exposed to browser)
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_DEBUG_MODE=true

# Private variables (server-side only)
SECRET_API_KEY=your-secret-key
DATABASE_URL=postgresql://localhost:5432/mydb
```

For production, set variables at runtime:

::: code-group

```bash [Docker]
docker run \
  -e NEXT_PUBLIC_API_URL=https://api.prod.com \
  -e SECRET_API_KEY=prod-secret \
  your-app
```

```bash [Shell]
NEXT_PUBLIC_API_URL=https://api.prod.com \
SECRET_API_KEY=prod-secret \
npm start
```

```bash [Vercel]
# Set in Vercel dashboard under Environment Variables
# Or use Vercel CLI
vercel env add NEXT_PUBLIC_API_URL
```

:::

## That's It!

You're done. Your environment variables are now dynamic—change them at runtime without rebuilding.

::: tip Pro Tip Use [type-safe parsers](/api/parsers) to convert environment strings to proper types:

```tsx
import { envParsers } from 'next-dynenv'

const port = envParsers.number('NEXT_PUBLIC_PORT', 3000)
const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG')
```

:::

## Next Steps

- [How It Works](/guide/how-it-works) - Understand the mechanism
- [Type-Safe Parsers](/api/parsers) - Convert strings to typed values
- [Security](/guide/security) - Security best practices
