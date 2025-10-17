[![npm version][npm-img]][npm-url] [![GitHub][github-img]][github-url] [![License][license-img]][license-url]

# 🌐 Next.js Runtime Environment Configuration

**Effortlessly populate your environment at runtime, not just at build time, with `@hyperb1iss/next-runtime-env`.**

> **Fork Notice:** This package is a Next.js 15 & React 19 compatible fork of the original [next-runtime-env](https://github.com/expatfile/next-runtime-env) by Expatfile.tax LLC. All credit for the original implementation goes to the original authors.

## ✨ Highlights

- **Isomorphic Design:** Works seamlessly on both server and browser, and even in middleware
- **Next.js 15 & React 19 Ready:** Fully compatible with the latest Next.js features including async server components
- **`.env` Friendly:** Use `.env` files during development, just like standard Next.js
- **Type-Safe:** Full TypeScript support for environment variables
- **Zero Config:** Works out of the box with sensible defaults

## 🤔 Why `next-runtime-env`?

In the modern software development landscape, the [Build once, deploy many](https://www.mikemcgarr.com/blog/build-once-deploy-many.html) philosophy is key. This principle, essential for easy deployment and testability, is a [cornerstone of continuous delivery](https://cloud.redhat.com/blog/build-once-deploy-anywhere) and is embraced by the [twelve-factor methodology](https://12factor.net). However, front-end development, particularly with Next.js, often lacks support for this - requiring separate builds for different environments. `next-runtime-env` bridges this gap in Next.js.

## 📦 How It Works

`next-runtime-env` dynamically injects environment variables into your Next.js application at runtime. This approach adheres to the "build once, deploy many" principle, allowing the same build to be used across various environments without rebuilds.

## 🔖 Version Guide

This fork starts at version **4.x** to clearly differentiate from the original project:

- **@hyperb1iss/next-runtime-env@4.x:** Next.js 15 & React 19 with modern async server components

Original project versions (unmaintained):
- **next-runtime-env@3.x:** Next.js 14 with advanced caching
- **next-runtime-env@2.x:** Next.js 13 App Router
- **next-runtime-env@1.x:** Next.js 12/13 Pages Router

## 📦 Installation

```bash
npm install @hyperb1iss/next-runtime-env
# or
pnpm add @hyperb1iss/next-runtime-env
# or
yarn add @hyperb1iss/next-runtime-env
```

## 🚀 Getting Started

### Step 1: Add the Script Component

In your root layout (`app/layout.tsx`), add the `PublicEnvScript` component:

```tsx
// app/layout.tsx
import { PublicEnvScript } from '@hyperb1iss/next-runtime-env';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

The `PublicEnvScript` component automatically exposes all environment variables prefixed with `NEXT_PUBLIC_` to the browser. For custom variable exposure, refer to the [Exposing Custom Environment Variables](docs/EXPOSING_CUSTOM_ENV.md) guide.

### Step 2: Use Environment Variables

#### In Client Components

```tsx
// app/components/ClientComponent.tsx
'use client';

import { env } from '@hyperb1iss/next-runtime-env';

export default function ClientComponent() {
  const apiUrl = env('NEXT_PUBLIC_API_URL');
  const debug = env('NEXT_PUBLIC_DEBUG_MODE');

  return (
    <div>
      <p>API URL: {apiUrl}</p>
      <p>Debug Mode: {debug}</p>
    </div>
  );
}
```

#### In Server Components (Next.js 15+)

```tsx
// app/components/ServerComponent.tsx
import { env } from '@hyperb1iss/next-runtime-env';

export default async function ServerComponent() {
  // Server components in Next.js 15 can be async
  const apiUrl = env('NEXT_PUBLIC_API_URL');
  const secretKey = env('SECRET_API_KEY'); // Server-side only variables also work

  return (
    <div>
      <p>API URL: {apiUrl}</p>
      {/* Never expose secret keys to the client */}
    </div>
  );
}
```

> **Note:** In Next.js 15, server components can be async by default. The `env()` function works seamlessly in both sync and async server components.

#### In Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Access environment variables in middleware
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Your middleware logic here
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## 🛠 Advanced Usage

### Exposing Non-Prefixed Variables

Need to expose environment variables without the `NEXT_PUBLIC_` prefix? Check out the [Making Environment Variables Public](docs/MAKING_ENV_PUBLIC.md) guide.

### Custom Variable Exposure

For fine-grained control over which variables are exposed to the browser, see the [Exposing Custom Environment Variables](docs/EXPOSING_CUSTOM_ENV.md) guide.

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
3. Deploy your application - `next-runtime-env` will automatically use the runtime values

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
3. The variables will be available at runtime through `next-runtime-env`

## 🔒 Security Considerations

### Never Expose Secrets to the Browser

**Critical:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never expose sensitive data:

```tsx
// ❌ WRONG - Don't expose secrets
const apiKey = env('SECRET_API_KEY'); // Will be undefined in browser

// ✅ CORRECT - Use secrets only server-side
export async function getData() {
  const apiKey = process.env.SECRET_API_KEY; // Server-side only
  // ... fetch data
}
```

### Environment Variable Validation

Validate required environment variables at build time:

```tsx
// lib/env.ts
import { env } from '@hyperb1iss/next-runtime-env';

export function validateEnv() {
  const required = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_ID'];

  for (const key of required) {
    if (!env(key)) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

// Call in your app initialization
validateEnv();
```

### Content Security Policy

If using CSP, ensure inline scripts are allowed for the `PublicEnvScript`:

```tsx
// next.config.js
const ContentSecurityPolicy = `
  script-src 'self' 'unsafe-inline';
`;

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
    ];
  },
};
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
const apiUrl = env('NEXT_PUBLIC_API_URL') ?? 'https://default-api.com';

// Or with type assertion if you're certain it exists
const apiUrl = env('NEXT_PUBLIC_API_URL')!;
```

### Build-Time vs Runtime Variables

**Problem:** Confusion about when variables are available.

**Explanation:**
- **Build-time:** Variables are baked into the bundle during `next build`
- **Runtime:** Variables are injected when the application starts
- `next-runtime-env` provides runtime access, allowing the same build to work in multiple environments

### Server vs Client Environment Access

**Problem:** Different behavior between server and client.

**Key Differences:**
- **Server components/API routes:** Can access ALL environment variables via `process.env`
- **Client components:** Can only access `NEXT_PUBLIC_*` variables via `env()`
- **Middleware:** Uses standard `process.env` access

## 📚 Additional Resources

- [Exposing Custom Environment Variables](docs/EXPOSING_CUSTOM_ENV.md)
- [Making Environment Variables Public](docs/MAKING_ENV_PUBLIC.md)

## 👷 Maintenance

This fork is maintained by [Stefanie Jane (@hyperb1iss)](https://github.com/hyperb1iss).

## 🙏 Acknowledgments

- **Original Project:** [next-runtime-env](https://github.com/expatfile/next-runtime-env) by [Expatfile.tax](https://expatfile.tax) - All credit for the original implementation and core concepts
- **Inspiration:** [react-env](https://github.com/andrewmclagan/react-env) project
- **Context Provider:** Thanks to @andonirdgz for the innovative context provider idea

---

[npm-img]: https://img.shields.io/npm/v/@hyperb1iss/next-runtime-env
[npm-url]: https://www.npmjs.com/package/@hyperb1iss/next-runtime-env
[github-img]: https://img.shields.io/github/stars/hyperb1iss/next-runtime-env?style=social
[github-url]: https://github.com/hyperb1iss/next-runtime-env
[license-img]: https://img.shields.io/npm/l/@hyperb1iss/next-runtime-env
[license-url]: https://github.com/hyperb1iss/next-runtime-env/blob/main/LICENSE.md
[build-once-deploy-many-link]: https://www.mikemcgarr.com/blog/build-once-deploy-many.html
[fundamental-principle-link]: https://cloud.redhat.com/blog/build-once-deploy-anywhere
[twelve-factor-link]: https://12factor.net
