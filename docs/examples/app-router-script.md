# App Router with Script Approach

This is the **recommended approach** for most Next.js applications. The Script approach injects environment variables
via a `<script>` tag, making them available everywhere - client components, server components, middleware, API routes,
and even vanilla JavaScript.

## Why Choose the Script Approach?

- **Universal access** - Works in middleware, API routes, client/server components
- **No React dependency** - Access variables outside React components
- **Simpler setup** - Just add one tag to your root layout
- **Framework agnostic** - Third-party libraries can access variables too
- **Production-ready** - Used in production apps handling millions of requests

## Project Structure

This example demonstrates a complete Next.js application with:

```
app/
├── layout.tsx               # Root layout with PublicEnvScript
├── page.tsx                 # Server component demonstration
├── components/
│   ├── ClientConfig.tsx     # Client component with type-safe parsing
│   └── FeatureFlags.tsx     # Feature flag implementation
├── api/
│   └── config/
│       └── route.ts         # API route with env validation
└── middleware.ts            # Edge middleware with runtime config
```

## Setup

### 1. Installation

First, install `next-dynenv`:

```bash
npm install next-dynenv
# or
pnpm add next-dynenv
# or
yarn add next-dynenv
```

### 2. Root Layout Setup

Add `PublicEnvScript` to your root layout's `<head>` section. This is the **only required setup step**.

```tsx
// app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
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

::: warning Important The `PublicEnvScript` must be in the `<head>` section, not in the `<body>`. This ensures
environment variables are available before React hydrates. :::

### 3. Environment Variables

Create a `.env.local` file (or use your deployment platform's environment settings):

```bash
# .env.local

# Public variables (accessible to client-side code)
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=My App
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_FEATURES=auth,payments,analytics
NEXT_PUBLIC_VERSION=1.0.0

# Server-only secrets (NOT accessible to client)
SECRET_API_KEY=sk_secret_123
DATABASE_URL=postgres://localhost:5432/mydb
STRIPE_SECRET_KEY=sk_live_...
```

::: tip Variable Naming Only variables prefixed with `NEXT_PUBLIC_` are accessible in client-side code. Server-only
variables without this prefix remain secure and will throw an error if accessed in the browser. :::

## Real-World Usage Examples

### Server Component

Server components can access both public and secret environment variables. This is useful for server-side rendering with
configuration or checking if services are properly configured.

```tsx
// app/page.tsx
import { env } from 'next-dynenv'
import { ClientConfig } from './components/ClientConfig'
import { FeatureFlags } from './components/FeatureFlags'

export default function Home() {
    // Server components can access ALL environment variables
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const appName = env('NEXT_PUBLIC_APP_NAME', 'Default App')

    // Secret variables are only accessible on the server
    const hasSecretKey = !!env('SECRET_API_KEY')
    const hasDatabaseUrl = !!env('DATABASE_URL')

    return (
        <main className="container">
            <h1>{appName}</h1>
            <p>Runtime Environment Configuration Demo</p>

            {/* Server-rendered content */}
            <section className="server-section">
                <h2>Server Component</h2>
                <p>
                    API Endpoint: <code>{apiUrl}</code>
                </p>

                {/* Safe way to show secrets are configured without exposing them */}
                <div className="status">
                    <p>API Key: {hasSecretKey ? '✓ Configured' : '✗ Missing'}</p>
                    <p>Database: {hasDatabaseUrl ? '✓ Connected' : '✗ Not configured'}</p>
                </div>
            </section>

            {/* Client components */}
            <section className="client-section">
                <h2>Client Components</h2>
                <ClientConfig />
                <FeatureFlags />
            </section>
        </main>
    )
}
```

::: warning Never Expose Secrets While server components can access secret variables, **never render them directly in
JSX**. Check for their existence instead, as shown above. :::

### Client Component with Type-Safe Parsing

Client components can only access `NEXT_PUBLIC_*` variables. The `envParsers` utility provides type-safe parsing for
booleans, numbers, arrays, and JSON.

```tsx
// app/components/ClientConfig.tsx
'use client'

import { env, envParsers } from 'next-dynenv'

export function ClientConfig() {
    // Basic string access with fallback
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const appName = env('NEXT_PUBLIC_APP_NAME', 'Default App')
    const version = env('NEXT_PUBLIC_VERSION', '0.0.0')

    // Type-safe parsing - returns proper types, not strings
    const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG') // true | false
    const features = envParsers.array('NEXT_PUBLIC_FEATURES') // string[]

    // Example: using parsed values in logic
    const apiStatus = debug ? 'verbose' : 'quiet'
    const featureCount = features.length

    return (
        <div className="config-panel">
            <h3>Configuration</h3>

            <dl>
                <dt>API Endpoint:</dt>
                <dd>
                    <code>{apiUrl}</code>
                </dd>

                <dt>Application:</dt>
                <dd>
                    {appName} <span className="version">v{version}</span>
                </dd>

                <dt>Debug Mode:</dt>
                <dd>
                    <span className={debug ? 'enabled' : 'disabled'}>{debug ? '🔍 Enabled' : '✓ Disabled'}</span>
                    <small>(Logging: {apiStatus})</small>
                </dd>

                <dt>Active Features:</dt>
                <dd>
                    {featureCount > 0 ? (
                        <ul>
                            {features.map((feature) => (
                                <li key={feature}>{feature}</li>
                            ))}
                        </ul>
                    ) : (
                        <em>No features enabled</em>
                    )}
                </dd>
            </dl>
        </div>
    )
}
```

::: tip Type-Safe Parsing The `envParsers` utilities ensure you get the correct type:

- `envParsers.boolean()` - Returns `boolean` (handles "true"/"false" strings)
- `envParsers.number()` - Returns `number`
- `envParsers.array()` - Returns `string[]` (splits on commas)
- `envParsers.json()` - Returns parsed JSON object :::

### Feature Flags Pattern

A common real-world pattern is using environment variables for feature flags. This allows you to enable/disable features
at runtime without redeploying.

```tsx
// app/components/FeatureFlags.tsx
'use client'

import { envParsers } from 'next-dynenv'

export function FeatureFlags() {
    // Parse comma-separated feature list
    const features = envParsers.array('NEXT_PUBLIC_FEATURES')

    // Check individual features
    const hasAuth = features.includes('auth')
    const hasPayments = features.includes('payments')
    const hasAnalytics = features.includes('analytics')

    return (
        <div className="feature-flags">
            <h3>Feature Flags</h3>
            <p className="description">Toggle features at runtime by changing NEXT_PUBLIC_FEATURES</p>

            <div className="features-grid">
                <FeatureItem name="Authentication" enabled={hasAuth} description="User login and OAuth support" />
                <FeatureItem name="Payments" enabled={hasPayments} description="Stripe payment processing" />
                <FeatureItem name="Analytics" enabled={hasAnalytics} description="User behavior tracking" />
            </div>

            {/* Conditionally render features */}
            {hasAuth && (
                <div className="auth-panel">
                    <button>Sign In</button>
                </div>
            )}

            {hasPayments && (
                <div className="payment-panel">
                    <button>Upgrade to Pro</button>
                </div>
            )}
        </div>
    )
}

function FeatureItem({ name, enabled, description }: { name: string; enabled: boolean; description: string }) {
    return (
        <div className={`feature-item ${enabled ? 'enabled' : 'disabled'}`}>
            <div className="feature-header">
                <span className="icon">{enabled ? '✓' : '✗'}</span>
                <strong>{name}</strong>
            </div>
            <p className="feature-description">{description}</p>
        </div>
    )
}
```

::: info Real-World Use Case Feature flags are perfect for:

- Gradual rollouts (enable for staging, disable for production)
- A/B testing different features
- Emergency kill switches
- Environment-specific capabilities :::

## API Routes with Environment Variables

API routes can access both public and secret variables. Use `requireEnv()` to validate required server-side
configuration.

```ts
// app/api/config/route.ts
import { env, requireEnv, envParsers } from 'next-dynenv'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Validate required server-side configuration
        // Throws an error if missing, preventing silent failures
        const secretKey = requireEnv('SECRET_API_KEY')
        const databaseUrl = requireEnv('DATABASE_URL')

        // Public configuration (safe to return to client)
        const publicConfig = {
            apiUrl: env('NEXT_PUBLIC_API_URL'),
            appName: env('NEXT_PUBLIC_APP_NAME'),
            version: env('NEXT_PUBLIC_VERSION', '1.0.0'),
            debug: envParsers.boolean('NEXT_PUBLIC_DEBUG'),
            features: envParsers.array('NEXT_PUBLIC_FEATURES'),
        }

        // Server status (don't expose actual secrets!)
        const serverStatus = {
            apiKeyConfigured: !!secretKey,
            databaseConnected: !!databaseUrl,
            environment: env('NODE_ENV', 'development'),
        }

        return NextResponse.json({
            config: publicConfig,
            status: serverStatus,
        })
    } catch (error) {
        // Handle missing required environment variables
        return NextResponse.json(
            {
                error: 'Server configuration error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
        )
    }
}
```

::: tip Use requireEnv() for Critical Variables `requireEnv()` throws an error if the variable is missing, making it
perfect for validating required server configuration at startup or in API routes. :::

## Edge Middleware with Runtime Config

Middleware runs on the edge and can access runtime environment variables. This is perfect for maintenance modes, feature
gates, or A/B testing.

```ts
// middleware.ts
import { env, envParsers } from 'next-dynenv'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check maintenance mode
    const maintenanceMode = envParsers.boolean('NEXT_PUBLIC_MAINTENANCE')

    if (maintenanceMode) {
        // Redirect all traffic to maintenance page
        const maintenanceUrl = new URL('/maintenance', request.url)
        return NextResponse.redirect(maintenanceUrl)
    }

    // Parse enabled features
    const features = envParsers.array('NEXT_PUBLIC_FEATURES')

    // Block access to payment routes if payments are disabled
    if (request.nextUrl.pathname.startsWith('/checkout') && !features.includes('payments')) {
        return NextResponse.redirect(new URL('/upgrade-required', request.url))
    }

    // Add environment headers for debugging (useful in development)
    const response = NextResponse.next()
    const isDebug = envParsers.boolean('NEXT_PUBLIC_DEBUG')

    if (isDebug) {
        response.headers.set('x-environment', env('NEXT_PUBLIC_ENV', 'development'))
        response.headers.set('x-features', features.join(','))
        response.headers.set('x-api-url', env('NEXT_PUBLIC_API_URL', 'not-set'))
    }

    return response
}

export const config = {
    // Run middleware on all routes except static assets
    matcher: ['/((?!_next/static|_next/image|favicon.ico|maintenance).*)'],
}
```

::: info Why Use Middleware? Middleware is perfect for:

- **Maintenance modes** - Toggle at runtime without deploying
- **Feature gates** - Block routes for disabled features
- **A/B testing** - Route users based on flags
- **Debug headers** - Add diagnostic info in development :::

## Docker Deployment - Build Once, Run Anywhere

This is where `next-dynenv` really shines. Build your Docker image once and deploy it to multiple environments with
different configurations.

### Dockerfile

```dockerfile
# Multi-stage build for optimal image size
FROM node:22-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build without environment variables
# They'll be injected at runtime!
RUN corepack enable pnpm && pnpm build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
```

### Running with Different Environments

The magic happens here - same image, different configurations:

```bash
# Development environment
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080 \
  -e NEXT_PUBLIC_APP_NAME="Dev App" \
  -e NEXT_PUBLIC_DEBUG=true \
  -e NEXT_PUBLIC_FEATURES=auth,payments,analytics \
  -e SECRET_API_KEY=dev_key_123 \
  my-app

# Staging environment
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.staging.com \
  -e NEXT_PUBLIC_APP_NAME="Staging" \
  -e NEXT_PUBLIC_DEBUG=true \
  -e NEXT_PUBLIC_FEATURES=auth,payments \
  -e SECRET_API_KEY=staging_key_456 \
  my-app

# Production environment
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.production.com \
  -e NEXT_PUBLIC_APP_NAME="Production" \
  -e NEXT_PUBLIC_DEBUG=false \
  -e NEXT_PUBLIC_FEATURES=auth,payments,analytics \
  -e SECRET_API_KEY=prod_key_789 \
  -e DATABASE_URL=postgres://prod-db:5432/app \
  my-app
```

### Docker Compose Example

```yaml
# docker-compose.yml
version: '3.8'

services:
    app:
        build: .
        ports:
            - '3000:3000'
        environment:
            # Runtime environment variables
            NEXT_PUBLIC_API_URL: ${API_URL:-http://localhost:8080}
            NEXT_PUBLIC_APP_NAME: ${APP_NAME:-My App}
            NEXT_PUBLIC_DEBUG: ${DEBUG:-false}
            NEXT_PUBLIC_FEATURES: ${FEATURES:-auth,payments}
            SECRET_API_KEY: ${SECRET_API_KEY}
            DATABASE_URL: ${DATABASE_URL}
        env_file:
            - .env.local # Load from file
```

Then run with different `.env` files:

```bash
# Development
docker-compose up

# Staging
docker-compose --env-file .env.staging up

# Production
docker-compose --env-file .env.production up
```

::: tip Build Once, Deploy Everywhere With traditional Next.js, you'd need separate builds for each environment. With
`next-dynenv`, you build once and pass environment variables at runtime - just like any other web application. :::

## Running the Example Locally

### Quick Start

```bash
# Clone the repository
git clone https://github.com/hyperb1iss/next-dynenv.git
cd next-dynenv/examples/with-app-router-script

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the example running.

### Testing Different Configurations

Try changing environment variables without rebuilding:

```bash
# Test with staging API
NEXT_PUBLIC_API_URL=https://api.staging.com \
NEXT_PUBLIC_APP_NAME="Staging" \
NEXT_PUBLIC_DEBUG=true \
pnpm dev

# Test with production-like settings
NEXT_PUBLIC_API_URL=https://api.production.com \
NEXT_PUBLIC_APP_NAME="Production" \
NEXT_PUBLIC_DEBUG=false \
NEXT_PUBLIC_FEATURES=auth,payments \
pnpm dev

# Test maintenance mode
NEXT_PUBLIC_MAINTENANCE=true \
pnpm dev
```

### What to Explore

1. **Server vs Client** - Notice how server components can access all variables, but client components are restricted to
   `NEXT_PUBLIC_*`
2. **Type Parsing** - See how `envParsers` converts string environment variables to proper types
3. **Feature Flags** - Toggle features by changing `NEXT_PUBLIC_FEATURES`
4. **Middleware** - Enable maintenance mode and see how middleware blocks all routes
5. **API Routes** - Check `/api/config` to see server configuration

## Key Takeaways

### Why This Approach Works

1. **PublicEnvScript in `<head>`** - Injects variables before React hydrates, ensuring they're available immediately
2. **Universal `env()` function** - Same API works everywhere (server, client, middleware, API routes)
3. **Type-safe parsing** - `envParsers` utilities convert strings to proper types
4. **Security by default** - Non-public variables throw errors if accessed in the browser
5. **Docker-friendly** - Build once, deploy anywhere with runtime configuration

### Common Patterns

- **Feature flags** - Use comma-separated values: `NEXT_PUBLIC_FEATURES=auth,payments`
- **Boolean flags** - Use string "true"/"false", parse with `envParsers.boolean()`
- **API configuration** - Store base URLs and toggle debug modes
- **Environment detection** - Use `NEXT_PUBLIC_ENV` to change behavior per environment
- **Maintenance modes** - Toggle features in middleware without redeploying

### Best Practices

- **Always prefix client variables** with `NEXT_PUBLIC_`
- **Use `requireEnv()`** for critical server-side configuration
- **Don't render secrets** in JSX, even in server components
- **Provide fallbacks** for optional configuration
- **Document your variables** in a `.env.example` file

## Next Steps

- Explore the [Context Approach](/examples/app-router-context) for a React-first alternative
- Check the [API Reference](/api/) for complete API documentation
- Review [Security Guide](/guide/security) for best practices

::: tip Ready to Use in Production This pattern is battle-tested and used in production applications. The example code
is production-ready - feel free to copy and adapt it for your project! :::
