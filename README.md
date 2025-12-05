# 🌐 next-dynenv

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js%2015%20%7C%2016-e135ff.svg?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-80ffea.svg?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ff79c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-f1fa8c?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://opensource.org/licenses/MIT)

[![npm version](https://img.shields.io/npm/v/next-dynenv?style=for-the-badge&logo=npm&logoColor=white&color=50fa7b)](https://www.npmjs.com/package/next-dynenv)
[![CI](https://img.shields.io/github/actions/workflow/status/hyperb1iss/next-dynenv/ci.yml?branch=development&style=for-the-badge&logo=github&logoColor=white&label=CI)](https://github.com/hyperb1iss/next-dynenv/actions)
[![Downloads](https://img.shields.io/npm/dm/next-dynenv?style=for-the-badge&logo=npm&logoColor=white&color=ffb86c)](https://www.npmjs.com/package/next-dynenv)

**Effortlessly populate your environment at runtime, not just at build time.**

[⚡ Installation](#-installation) • [🚀 Getting Started](#-getting-started) • [🛠 Advanced Usage](#-advanced-usage) •
[🚀 Deployment](#-deployment-guide)

</div>

**Dynamic runtime environment variables for Next.js.** This package is a Next.js 15/16 & React 19 compatible fork of
[next-runtime-env](https://github.com/expatfile/next-runtime-env) by Expatfile.tax LLC.

## ✨ Highlights

- **Isomorphic Design:** Works seamlessly on both server and browser, and even in middleware
- **Next.js 15/16 & React 19 Ready:** Fully compatible with the latest Next.js features including async server
  components
- **`.env` Friendly:** Use `.env` files during development, just like standard Next.js
- **Type-Safe Parsers:** Convert environment strings to booleans, numbers, arrays, JSON, URLs, and enums
- **Secure by Default:** XSS protection via JSON escaping, immutable runtime values with `Object.freeze`
- **Zero Config:** Works out of the box with sensible defaults

## 🤔 Why `next-dynenv`?

In the modern software development landscape, the
[Build once, deploy many](https://www.mikemcgarr.com/blog/build-once-deploy-many.html) philosophy is key. This
principle, essential for easy deployment and testability, is a
[cornerstone of continuous delivery](https://cloud.redhat.com/blog/build-once-deploy-anywhere) and is embraced by the
[twelve-factor methodology](https://12factor.net). However, front-end development, particularly with Next.js, often
lacks support for this - requiring separate builds for different environments. `next-dynenv` bridges this gap.

## 📦 How It Works

`next-dynenv` dynamically injects environment variables into your Next.js application at runtime. This approach adheres
to the "build once, deploy many" principle, allowing the same build to be used across various environments without
rebuilds.

## 🔖 Version Guide

- **next-dynenv@4.x:** Next.js 15/16 & React 19 with modern async server components

Original project versions (unmaintained):

- **next-runtime-env@3.x:** Next.js 14 with advanced caching
- **next-runtime-env@2.x:** Next.js 13 App Router
- **next-runtime-env@1.x:** Next.js 12/13 Pages Router

## 📦 Installation

```bash
npm install next-dynenv
# or
pnpm add next-dynenv
# or
yarn add next-dynenv
```

## 🚀 Getting Started

### Step 1: Add the Script Component

In your root layout (`app/layout.tsx`), add the `PublicEnvScript` component:

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

The `PublicEnvScript` component automatically exposes all environment variables prefixed with `NEXT_PUBLIC_` to the
browser. For custom variable exposure, refer to the [Exposing Custom Environment Variables](docs/EXPOSING_CUSTOM_ENV.md)
guide.

### Step 2: Use Environment Variables

#### In Client Components

```tsx
// app/components/ClientComponent.tsx
'use client'

import { env } from 'next-dynenv'

export default function ClientComponent() {
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

#### In Server Components (Next.js 15+)

```tsx
// app/components/ServerComponent.tsx
import { env } from 'next-dynenv'

export default async function ServerComponent() {
    // Server components in Next.js 15 can be async
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const secretKey = env('SECRET_API_KEY') // Server-side only variables also work

    return (
        <div>
            <p>API URL: {apiUrl}</p>
            {/* Never expose secret keys to the client */}
        </div>
    )
}
```

> **Note:** In Next.js 15, server components can be async by default. The `env()` function works seamlessly in both sync
> and async server components.

#### In Middleware

```tsx
// middleware.ts
import { env } from 'next-dynenv'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // env() works in middleware too!
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const featureFlag = env('NEXT_PUBLIC_ENABLE_FEATURE')

    // Your middleware logic here
    if (featureFlag === 'true') {
        // Feature-specific logic
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}
```

> **Note:** The `env()` function works in all Next.js contexts - server components, client components, API routes, and
> middleware. It's safe to use everywhere and provides a consistent API across your application.

### Default Values

The `env()` function accepts an optional default value:

```tsx
import { env } from 'next-dynenv'

// Returns 'https://api.default.com' if NEXT_PUBLIC_API_URL is undefined
const apiUrl = env('NEXT_PUBLIC_API_URL', 'https://api.default.com')

// Default values work in all contexts (client, server, middleware)
const timeout = env('NEXT_PUBLIC_TIMEOUT', '5000')
```

### Required Environment Variables

Use `requireEnv()` when a variable must be defined:

```tsx
import { requireEnv } from 'next-dynenv'

// Throws descriptive error if NEXT_PUBLIC_API_URL is undefined
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
// Error: "Required environment variable 'NEXT_PUBLIC_API_URL' is not defined."
```

### Type-Safe Parsers

Use `envParsers` to convert environment strings to typed values:

```tsx
import { envParsers } from 'next-dynenv'

// Boolean - recognizes 'true', '1', 'yes', 'on' (case-insensitive)
const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG') // false by default
const enabled = envParsers.boolean('NEXT_PUBLIC_FEATURE', true) // custom default

// Number - integers and floats
const port = envParsers.number('NEXT_PUBLIC_PORT', 3000)
const ratio = envParsers.number('NEXT_PUBLIC_RATIO', 1.0)

// Array - comma-separated values (trims whitespace, filters empty)
const features = envParsers.array('NEXT_PUBLIC_FEATURES')
// 'auth, payments, analytics' → ['auth', 'payments', 'analytics']

// JSON - parse complex objects
interface Config {
    api: string
    timeout: number
}
const config = envParsers.json<Config>('NEXT_PUBLIC_CONFIG')

// URL - validates and returns URL string
const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const cdn = envParsers.url('NEXT_PUBLIC_CDN', 'https://cdn.default.com')

// Enum - restrict to allowed values with type safety
type Environment = 'development' | 'staging' | 'production'
const appEnv = envParsers.enum<Environment>(
    'NEXT_PUBLIC_ENV',
    ['development', 'staging', 'production'],
    'development', // default value
)

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const logLevel = envParsers.enum<LogLevel>('NEXT_PUBLIC_LOG_LEVEL', ['debug', 'info', 'warn', 'error'])
```

All parsers work isomorphically (server and client) and provide clear error messages for invalid values.

## 🛠 Advanced Usage

### Exposing Non-Prefixed Variables

Need to expose environment variables without the `NEXT_PUBLIC_` prefix? Check out the
[Making Environment Variables Public](docs/MAKING_ENV_PUBLIC.md) guide.

### Custom Variable Exposure

For fine-grained control over which variables are exposed to the browser, see the
[Exposing Custom Environment Variables](docs/EXPOSING_CUSTOM_ENV.md) guide.

## 🚀 Deployment Guide

### Docker Deployment

When deploying with Docker, pass environment variables at runtime:

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

Run with environment variables:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  -e NEXT_PUBLIC_APP_VERSION=1.0.0 \
  your-app:latest
```

### Vercel Deployment

1. Add environment variables in your Vercel project settings
2. Set different values for Preview, Development, and Production environments
3. Deploy your application - `next-dynenv` will automatically use the runtime values

```bash
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL preview
```

### Netlify Deployment

Add environment variables in your Netlify site settings:

1. Go to Site settings → Environment variables
2. Add your `NEXT_PUBLIC_*` variables
3. Deploy contexts can have different values (Production, Deploy Previews, Branch deploys)

### AWS Amplify

Configure environment variables in the Amplify Console:

1. Navigate to App settings → Environment variables
2. Add variables for each branch as needed
3. Amplify will inject these at runtime during deployment

### Generic Static Hosting

For static exports with runtime environment support:

1. Build your application: `npm run build`
2. Set environment variables on your hosting platform
3. The variables will be available at runtime through `next-dynenv`

## 🔒 Security Considerations

### Built-in Security Features

This library includes multiple layers of security by default:

- **XSS Protection:** All environment values are JSON-escaped before injection, preventing script injection attacks
- **Immutable Runtime Values:** Environment values are wrapped with `Object.freeze()`, preventing modification after
  initialization
- **Strict Prefix Enforcement:** Only `NEXT_PUBLIC_*` variables are exposed to the browser; accessing private variables
  throws an error

### Never Expose Secrets to the Browser

**Critical:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never expose sensitive data:

```tsx
// ❌ WRONG - Don't try to access secrets in client components
'use client'
const apiKey = env('SECRET_API_KEY') // Throws error in browser!

// ✅ CORRECT - Use secrets only server-side
export async function getData() {
    const apiKey = env('SECRET_API_KEY') // Works in server components/API routes
    // ... fetch data securely
}
```

### Environment Variable Validation

Use `requireEnv()` for required variables, or validate multiple at once:

```tsx
// Using requireEnv() - throws if undefined
import { requireEnv } from 'next-dynenv'

const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')

// Validating multiple variables
import { env } from 'next-dynenv'

export function validateEnv() {
    const required = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_ID']

    for (const key of required) {
        if (!env(key)) {
            throw new Error(`Missing required environment variable: ${key}`)
        }
    }
}
```

### Content Security Policy

If using CSP, ensure inline scripts are allowed for the `PublicEnvScript`:

```tsx
// next.config.js
const ContentSecurityPolicy = `
  script-src 'self' 'unsafe-inline';
`

module.exports = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
                    },
                ],
            },
        ]
    },
}
```

## 🐛 Troubleshooting

### Variables Undefined in Browser

**Problem:** Environment variables return `undefined` in client components.

**Solutions:**

1. Ensure variables have the `NEXT_PUBLIC_` prefix
2. Verify `PublicEnvScript` is in your root layout's `<head>`
3. Check that variables are set in your environment (`.env.local`, hosting platform, etc.)
4. Restart your development server after adding new environment variables

### Variables Not Updating in Production

**Problem:** Changed environment variables don't reflect in deployed application.

**Solutions:**

1. For Docker: Restart containers with new environment variables
2. For Vercel/Netlify: Trigger a new deployment or redeploy
3. Clear CDN cache if using one
4. Verify variables are set in the correct deployment environment

### TypeScript Type Errors

**Problem:** TypeScript complains about `env()` return type.

**Solution:** The `env()` function returns `string | undefined`. Handle this explicitly:

```tsx
const apiUrl = env('NEXT_PUBLIC_API_URL') ?? 'https://default-api.com'

// Or with type assertion if you're certain it exists
const apiUrl = env('NEXT_PUBLIC_API_URL')!
```

### Build-Time vs Runtime Variables

**Problem:** Confusion about when variables are available.

**Explanation:**

- **Build-time:** Variables are baked into the bundle during `next build`
- **Runtime:** Variables are injected when the application starts
- `next-dynenv` provides runtime access, allowing the same build to work in multiple environments

### Server vs Client Environment Access

**Problem:** Different behavior between server and client.

**Key Differences:**

- **Server-side contexts** (server components, API routes, middleware):

    - Can access ALL environment variables via `env()` or `process.env`
    - Both private and public (`NEXT_PUBLIC_*`) variables are available

- **Client-side contexts** (client components, browser):
    - Can only access `NEXT_PUBLIC_*` variables via `env()`
    - Private variables are not available for security reasons
    - Attempting to access private variables throws an error

**Recommendation:** Use `env()` everywhere for consistency. It works in all contexts and provides better error messages
when misused

## 📚 Additional Resources

- [Exposing Custom Environment Variables](docs/EXPOSING_CUSTOM_ENV.md)
- [Making Environment Variables Public](docs/MAKING_ENV_PUBLIC.md)

## 👷 Maintenance

This fork is maintained by [Stefanie Jane (@hyperb1iss)](https://github.com/hyperb1iss).

## 🙏 Acknowledgments

- **Original Project:** [next-runtime-env](https://github.com/expatfile/next-runtime-env) by
  [Expatfile.tax](https://expatfile.tax) - All credit for the original implementation and core concepts
- **Inspiration:** [react-env](https://github.com/andrewmclagan/react-env) project
- **Context Provider:** Thanks to @andonirdgz for the innovative context provider idea

---

<div align="center">

If you find this useful, [buy me a Monster Ultra Violet ⚡](https://ko-fi.com/hyperb1iss)

</div>
