# Next.js Pages Router Support

`next-dynenv` version 4.x is designed for **Next.js 15 with App Router only** and does not support the Pages Router.

## Why No Pages Router Support?

This fork focuses on:

- Next.js 15 and React 19 compatibility
- Modern App Router architecture
- Async server components
- Latest Next.js features and patterns

The Pages Router uses a fundamentally different architecture that would require separate implementation and maintenance.

## Options for Pages Router Users

### Option 1: Use the Original Package (Unmaintained)

The original `next-runtime-env` package supports Pages Router:

```bash
npm install next-runtime-env@1.x
```

**Documentation:** [next-runtime-env@1.x](https://github.com/expatfile/next-runtime-env/tree/1.x)

**Note:** This version targets Next.js 12/13 and is no longer actively maintained.

### Option 2: Migrate to App Router (Recommended)

Next.js 15 and the App Router provide significant benefits:

- **Better Performance:** React Server Components reduce JavaScript sent to the browser
- **Improved Developer Experience:** Simplified data fetching and routing
- **Future-Proof:** App Router is the future of Next.js
- **Modern Features:** Server actions, streaming, and more

**Migration Guide:**
[Next.js App Router Migration](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

### Option 3: Implement Custom Solution

For Pages Router projects that can't migrate, you can implement a similar pattern:

**pages/\_app.tsx:**

```tsx
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
    // Inject runtime env vars
    if (typeof window !== 'undefined') {
        window.__ENV = {
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
            // Add other public variables
        }
    }

    return <Component {...pageProps} />
}
```

**lib/env.ts:**

```ts
export function env(key: string): string | undefined {
    if (typeof window !== 'undefined') {
        return (window as any).__ENV?.[key]
    }
    return process.env[key]
}
```

**Usage:**

```tsx
import { env } from '../lib/env'

export default function Page() {
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    return <div>API: {apiUrl}</div>
}
```

## Comparison: App Router vs Pages Router

| Feature            | App Router (v4.x) | Pages Router (v1.x) |
| ------------------ | ----------------- | ------------------- |
| Next.js Version    | 15+               | 12-13               |
| React Version      | 19+               | 17-18               |
| Server Components  | ✅ Yes            | ❌ No               |
| Streaming          | ✅ Yes            | ❌ No               |
| Maintenance Status | ✅ Active         | ⚠️ Unmaintained     |
| TypeScript         | ✅ Full Support   | ✅ Full Support     |
| Runtime Config     | ✅ Yes            | ✅ Yes              |

## Learn More

- **This Package (App Router):** [Main Documentation](../../README.md)
- **Original Package (Pages Router):** [next-runtime-env@1.x](https://github.com/expatfile/next-runtime-env/tree/1.x)
- **Next.js Migration Guide:**
  [Migrating to App Router](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- **Next.js Documentation:** [App Router vs Pages Router](https://nextjs.org/docs)

## Support

For questions or issues:

- **App Router (this package):** [GitHub Issues](https://github.com/hyperb1iss/next-dynenv/issues)
- **Pages Router (original):** [Original Repository](https://github.com/expatfile/next-runtime-env)

---

**Recommendation:** If you're starting a new project or can migrate, use the App Router with `next-dynenv@4.x` for the
best experience and ongoing support.
