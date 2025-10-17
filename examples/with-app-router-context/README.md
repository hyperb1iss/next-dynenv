# Next.js App Router with Context Provider Example

This example demonstrates the **React Context approach** for using `@hyperb1iss/next-runtime-env` with Next.js 15 App
Router.

## What This Example Demonstrates

- **Runtime environment injection** using the `<PublicEnvProvider>` component
- Type-safe access to environment variables via `useEnvContext()` hook
- Loading environment variables in **client components** with React Context
- Loading environment variables in **server components** and **API routes**
- Loading environment variables in **middleware**
- **Build once, deploy many**: Build without environment variables, run with them

## Architecture

This approach uses React Context to provide environment variables to your component tree:

```tsx
// app/layout.tsx
import { PublicEnvProvider } from '@hyperb1iss/next-runtime-env'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <PublicEnvProvider>{children}</PublicEnvProvider>
            </body>
        </html>
    )
}
```

Then access variables in client components using the `useEnvContext()` hook:

```tsx
'use client'
import { useEnvContext } from '@hyperb1iss/next-runtime-env'

export default function ClientComponent() {
    const { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_VERSION } = useEnvContext()
    return (
        <div>
            <p>API URL: {NEXT_PUBLIC_API_URL}</p>
            <p>Version: {NEXT_PUBLIC_APP_VERSION}</p>
        </div>
    )
}
```

## Benefits of the Context Approach

- **Type-safe destructuring**: Access multiple variables with a single hook call
- **React-friendly**: Follows standard React patterns for sharing state
- **No script tag in head**: Cleaner HTML output
- **Better for complex components**: Easier to manage multiple environment variables
- **Automatic re-renders**: Context changes trigger component updates

## When to Use Context vs Script

**Use Context Provider when:**

- You need to access multiple environment variables in a component
- You prefer React patterns and hooks
- You want type-safe variable access with destructuring
- You're building a component library that needs env access

**Use Script Tag when:**

- You need CSP nonce support
- You want the simplest possible setup
- You prefer functional `env()` calls over hooks
- You need to minimize bundle size

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

### 3. Configure Next.js (Optional)

The `next.config.js` includes configuration for the instrumentation hook:

```js
// next.config.js
module.exports = {
    experimental: {
        serverComponentsExternalPackages: ['next-runtime-env'],
        instrumentationHook: true,
    },
}
```

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
- **[/client-side](http://localhost:3000/client-side)** - Client component using `useEnvContext()` hook
- **[/server-side](http://localhost:3000/server-side)** - Server component accessing `BAR` and `BAZ`
- **[/api/bar-baz](http://localhost:3000/api/bar-baz)** - API route accessing server-side environment variables

### Expected Behavior

- **Client components** access variables via `useEnvContext()` hook
- Variables are destructured for clean, type-safe access
- **Server components** can access all variables (public and private)
- **API routes** can access all variables (public and private)
- **Middleware** can access all variables through `process.env`
- Environment variables are populated **at runtime**, not build time

## Key Files

- `src/app/layout.tsx` - Root layout with `<PublicEnvProvider>`
- `src/app/client-side/page.tsx` - Client component using `useEnvContext()` hook
- `src/app/server-side/page.tsx` - Server component example
- `src/app/api/bar-baz/route.ts` - API route example
- `src/instrumentation.ts` - Optional instrumentation for custom variable exposure
- `next.config.js` - Next.js configuration with external packages config

## Comparison with Script Tag Approach

### Context Provider Approach (This Example)

```tsx
'use client'
import { useEnvContext } from '@hyperb1iss/next-runtime-env'

export default function Component() {
    // Destructure multiple variables at once
    const { NEXT_PUBLIC_FOO, NEXT_PUBLIC_BAZ } = useEnvContext()

    return (
        <div>
            <p>Foo: {NEXT_PUBLIC_FOO}</p>
            <p>Baz: {NEXT_PUBLIC_BAZ}</p>
        </div>
    )
}
```

### Script Tag Approach

```tsx
'use client'
import { env } from '@hyperb1iss/next-runtime-env'

export default function Component() {
    // Call env() function for each variable
    const foo = env('NEXT_PUBLIC_FOO')
    const baz = env('NEXT_PUBLIC_BAZ')

    return (
        <div>
            <p>Foo: {foo}</p>
            <p>Baz: {baz}</p>
        </div>
    )
}
```

Both approaches work equally well - choose based on your preferences and requirements.

## Learn More

- [Main Documentation](../../README.md)
- [Script Tag Example](../with-app-router-script/README.md)
- [Exposing Custom Environment Variables](../../docs/EXPOSING_CUSTOM_ENV.md)
- [Making Environment Variables Public](../../docs/MAKING_ENV_PUBLIC.md)
- [Next.js 15 Documentation](https://nextjs.org/docs)
