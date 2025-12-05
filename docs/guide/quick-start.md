# Quick Start

Get runtime environment variables working in 2 minutes.

## Step 1: Add the Script Component

In your root layout (`app/layout.tsx`), add the `PublicEnvScript` component:

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

This automatically exposes all `NEXT_PUBLIC_*` environment variables to the browser at runtime.

## Step 2: Use Environment Variables

### In Client Components

```tsx
// app/components/ClientComponent.tsx
'use client'

import { env } from 'next-dynenv'

export function ClientComponent() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const debug = env('NEXT_PUBLIC_DEBUG_MODE')

    return (
        <div>
            <p>API URL: {apiUrl}</p>
            <p>Debug Mode: {debug}</p>
        </div>
    )
}
```

### In Server Components

```tsx
// app/components/ServerComponent.tsx
import { env } from 'next-dynenv'

export default function ServerComponent() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    // Server-side only variables also work
    const secretKey = env('SECRET_API_KEY')

    return (
        <div>
            <p>API URL: {apiUrl}</p>
            {/* Never expose secret keys to the client */}
        </div>
    )
}
```

### In Middleware

```tsx
// middleware.ts
import { env } from 'next-dynenv'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const featureFlag = env('NEXT_PUBLIC_ENABLE_FEATURE')

    if (featureFlag === 'true') {
        // Feature-specific logic
    }

    return NextResponse.next()
}
```

## Step 3: Set Environment Variables

Create a `.env.local` file for development:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_DEBUG_MODE=true
SECRET_API_KEY=your-secret-key
```

For production, set environment variables on your hosting platform or pass them at runtime:

```bash
# Docker
docker run -e NEXT_PUBLIC_API_URL=https://api.prod.com your-app

# Shell
NEXT_PUBLIC_API_URL=https://api.prod.com npm start
```

## That's It!

Your environment variables are now available at runtime. Change them without rebuilding your app.

## Next Steps

- [How It Works](/guide/how-it-works) - Understand the mechanism
- [Type-Safe Parsers](/api/parsers) - Convert strings to typed values
- [Security](/guide/security) - Security best practices
