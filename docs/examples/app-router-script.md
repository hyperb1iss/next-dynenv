# App Router with Script Approach

Complete example using `PublicEnvScript` for runtime environment variables.

## Project Structure

```
app/
├── layout.tsx          # Root layout with PublicEnvScript
├── page.tsx            # Server component
├── components/
│   ├── ClientConfig.tsx    # Client component using env()
│   └── FeatureFlags.tsx    # Feature flag example
└── api/
    └── config/
        └── route.ts    # API route
```

## Setup

### 1. Root Layout

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

### 2. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=My App
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_FEATURES=auth,payments,analytics
SECRET_API_KEY=sk_secret_123
DATABASE_URL=postgres://localhost:5432/mydb
```

## Components

### Server Component

```tsx
// app/page.tsx
import { env } from 'next-dynenv'
import { ClientConfig } from './components/ClientConfig'

export default function Home() {
    // Server can access all variables
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const secretKey = env('SECRET_API_KEY')

    return (
        <main>
            <h1>Environment Demo</h1>

            {/* Server-rendered */}
            <section>
                <h2>Server Component</h2>
                <p>API URL: {apiUrl}</p>
                {/* Never expose secrets in JSX! */}
                <p>Secret configured: {secretKey ? 'Yes' : 'No'}</p>
            </section>

            {/* Client component */}
            <section>
                <h2>Client Component</h2>
                <ClientConfig />
            </section>
        </main>
    )
}
```

### Client Component

```tsx
// app/components/ClientConfig.tsx
'use client'

import { env, envParsers } from 'next-dynenv'

export function ClientConfig() {
    // Basic string access
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const appName = env('NEXT_PUBLIC_APP_NAME', 'Default App')

    // Type-safe parsing
    const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG')
    const features = envParsers.array('NEXT_PUBLIC_FEATURES')

    return (
        <div>
            <p>API URL: {apiUrl}</p>
            <p>App Name: {appName}</p>
            <p>Debug Mode: {debug ? 'Enabled' : 'Disabled'}</p>
            <p>Features: {features.join(', ')}</p>
        </div>
    )
}
```

### Feature Flags Component

```tsx
// app/components/FeatureFlags.tsx
'use client'

import { envParsers } from 'next-dynenv'

export function FeatureFlags() {
    const features = envParsers.array('NEXT_PUBLIC_FEATURES')

    const hasAuth = features.includes('auth')
    const hasPayments = features.includes('payments')
    const hasAnalytics = features.includes('analytics')

    return (
        <div>
            <h3>Feature Flags</h3>
            <ul>
                <li>Auth: {hasAuth ? '✓' : '✗'}</li>
                <li>Payments: {hasPayments ? '✓' : '✗'}</li>
                <li>Analytics: {hasAnalytics ? '✓' : '✗'}</li>
            </ul>
        </div>
    )
}
```

## API Route

```ts
// app/api/config/route.ts
import { env, requireEnv } from 'next-dynenv'

export async function GET() {
    // Public config (safe to return)
    const publicConfig = {
        apiUrl: env('NEXT_PUBLIC_API_URL'),
        appName: env('NEXT_PUBLIC_APP_NAME'),
        debug: env('NEXT_PUBLIC_DEBUG') === 'true',
    }

    // Server-only validation
    const secretKey = requireEnv('SECRET_API_KEY')

    return Response.json({
        config: publicConfig,
        secretConfigured: !!secretKey,
    })
}
```

## Middleware Example

```ts
// middleware.ts
import { env } from 'next-dynenv'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const maintenanceMode = env('NEXT_PUBLIC_MAINTENANCE', 'false')

    if (maintenanceMode === 'true') {
        return NextResponse.redirect(new URL('/maintenance', request.url))
    }

    // Add environment to headers for debugging
    const response = NextResponse.next()
    response.headers.set('x-environment', env('NEXT_PUBLIC_ENV', 'development'))

    return response
}

export const config = {
    matcher: '/((?!maintenance|_next/static|_next/image|favicon.ico).*)',
}
```

## Docker Deployment

```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Run with different environments
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.staging.com \
  -e NEXT_PUBLIC_APP_NAME="Staging App" \
  my-app

docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.prod.com \
  -e NEXT_PUBLIC_APP_NAME="Production App" \
  my-app
```

## Running Locally

```bash
# Clone the repo
git clone https://github.com/hyperb1iss/next-dynenv.git
cd next-dynenv/examples/with-app-router-script

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Or start with different environment
NEXT_PUBLIC_API_URL=https://custom-api.com pnpm dev
```

Visit `http://localhost:3000` to see the example in action.

## Key Points

1. **PublicEnvScript in head** - Ensures variables are available before React hydrates
2. **env() works everywhere** - Same function for server and client
3. **envParsers for types** - Convert strings to booleans, numbers, arrays
4. **Secrets stay server-side** - Non-public variables throw in browser
5. **Docker-friendly** - One build, many environments
