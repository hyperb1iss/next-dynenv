# Next.js App Router with Script Tag Example

This example demonstrates the **script tag approach** for using `next-dynenv` with Next.js 15 App Router.

## What This Example Demonstrates

- **Runtime environment injection** using the `<PublicEnvScript>` component
- Loading environment variables in **client components** with the `env()` function
- Loading environment variables in **server components** and **API routes**
- Loading environment variables in **middleware**
- CSP nonce support for enhanced security
- **Build once, deploy many**: Build without environment variables, run with them

## Architecture

This approach uses a script tag injected into the `<head>` of your document to expose environment variables to the
browser:

```tsx
// app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

Then access variables anywhere using the `env()` function:

```tsx
'use client'
import { env } from 'next-dynenv'

export default function ClientComponent() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    return <div>API URL: {apiUrl}</div>
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Create Environment Variables

Create a `.env.local` file (for development):

```bash
# .env.local
NEXT_PUBLIC_FOO=foo-value
NEXT_PUBLIC_BAZ=baz-value
BAR=bar-value
```

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are automatically exposed to the browser. Server-only variables (like
> `BAR`) are only accessible in server components, API routes, and middleware.

## Running the Example

### Development Mode

```bash
NEXT_PUBLIC_FOO=foo-value BAR=bar-value BAZ=baz-value npm run dev
# or
NEXT_PUBLIC_FOO=foo-value BAR=bar-value BAZ=baz-value pnpm dev
# or
NEXT_PUBLIC_FOO=foo-value BAR=bar-value BAZ=baz-value yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Production Mode (Demonstrating Runtime Configuration)

**Step 1:** Build the app **without** environment variables:

```bash
npm run build
# or
pnpm build
# or
yarn build
```

**Step 2:** Run with environment variables at runtime:

```bash
NEXT_PUBLIC_FOO=foo-value BAR=bar-value BAZ=baz-value npm run start
# or
NEXT_PUBLIC_FOO=foo-value BAR=bar-value BAZ=baz-value pnpm start
# or
NEXT_PUBLIC_FOO=foo-value BAR=bar-value BAZ=baz-value yarn start
```

This demonstrates the core benefit: **the same build artifact works in any environment** by injecting variables at
runtime.

## What to Expect

### Available Routes

- **[/](http://localhost:3000)** - Home page with navigation
- **[/client-side](http://localhost:3000/client-side)** - Client component accessing `NEXT_PUBLIC_FOO` and
  `NEXT_PUBLIC_BAZ`
- **[/server-side](http://localhost:3000/server-side)** - Server component accessing `BAR` and `BAZ`
- **[/api/bar-baz](http://localhost:3000/api/bar-baz)** - API route accessing server-side environment variables

### Expected Behavior

- **Client components** can access `NEXT_PUBLIC_*` variables
- **Server components** can access all variables (public and private)
- **API routes** can access all variables (public and private)
- **Middleware** can access all variables through `process.env`
- Environment variables are populated **at runtime**, not build time

## Key Files

- `src/app/layout.tsx` - Root layout with `<PublicEnvScript>`
- `src/app/client-side/page.tsx` - Client component example
- `src/app/server-side/page.tsx` - Server component example
- `src/app/api/bar-baz/route.ts` - API route example
- `src/middleware.ts` - Middleware example
- `next.config.js` - Next.js configuration with instrumentation hook

## Learn More

- [Main Documentation](../../README.md)
- [Exposing Custom Environment Variables](../../docs/EXPOSING_CUSTOM_ENV.md)
- [Making Environment Variables Public](../../docs/MAKING_ENV_PUBLIC.md)
- [Next.js 15 Documentation](https://nextjs.org/docs)
