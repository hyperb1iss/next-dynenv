# Examples

Explore complete, real-world examples of `next-dynenv` in action. Each example demonstrates different approaches to
managing runtime environment variables in Next.js applications.

## Why Runtime Environment Variables?

Traditional Next.js embeds environment variables at build time, forcing you to rebuild for each deployment environment.
With `next-dynenv`, you can:

- **Build once, deploy everywhere** - Same Docker image across staging, production, and local development
- **Update configurations without rebuilds** - Change API endpoints, feature flags, or settings on the fly
- **Simplify Docker workflows** - Pass environment variables at runtime like any standard web application
- **Enable dynamic feature flags** - Toggle features without redeploying

## Official Examples

### [App Router with Script Approach](/examples/app-router-script) ⭐ Recommended

The most versatile approach using `PublicEnvScript` for injecting environment variables. Works everywhere - client
components, server components, middleware, API routes, and even plain JavaScript outside React.

```tsx
// app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head>
                <PublicEnvScript />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

**Use this approach when:**

- You need environment variables in middleware
- You're working with third-party libraries that need runtime config
- You want the simplest, most flexible solution
- Your app uses both client and server components

[View complete example →](/examples/app-router-script)

### [App Router with Context Approach](/examples/app-router-context)

A React-first approach using `PublicEnvProvider` for context-based environment access. Perfect for apps that are purely
React and want to leverage React's ecosystem.

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body>
                <PublicEnvProvider>{children}</PublicEnvProvider>
            </body>
        </html>
    )
}
```

**Use this approach when:**

- Your app is entirely React-based
- You prefer React patterns over globals
- You want visibility in React DevTools
- You need to nest or override environments in subtrees

[View complete example →](/examples/app-router-context)

## Approach Comparison

| Feature                 | Script Approach        | Context Approach             |
| ----------------------- | ---------------------- | ---------------------------- |
| **Access method**       | `env('KEY')` anywhere  | `useEnvContext()` hook       |
| **Works in middleware** | ✅ Yes                 | ❌ No (React only)           |
| **Works outside React** | ✅ Yes                 | ❌ No                        |
| **React DevTools**      | ❌ No                  | ✅ Yes                       |
| **Global scope**        | Yes (window.\_\_ENV)   | No                           |
| **Setup complexity**    | Single tag in `<head>` | Provider wrapper in `<body>` |
| **Best for**            | Most use cases         | Pure React apps              |

::: tip Recommendation Start with the **Script Approach** unless you have a specific reason to use Context. The Script
approach is more flexible and works everywhere in your Next.js app. :::

## Full Working Examples

Clone and run complete examples from the repository:

**[with-app-router-script](https://github.com/hyperb1iss/next-dynenv/tree/development/examples/with-app-router-script)**
Complete implementation with middleware, feature flags, API routes, and Docker deployment.

**[with-app-router-context](https://github.com/hyperb1iss/next-dynenv/tree/development/examples/with-app-router-context)**
React Context pattern with typed hooks, custom providers, and environment composition.

## Running Examples Locally

```bash
# Clone the repository
git clone https://github.com/hyperb1iss/next-dynenv.git
cd next-dynenv

# Install dependencies
pnpm install

# Run the Script approach example
cd examples/with-app-router-script
pnpm install
pnpm dev

# Or run the Context approach example
cd ../with-app-router-context
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to see the example running.

::: info Try Different Environments You can test runtime environment variable injection by changing variables and
refreshing:

```bash
NEXT_PUBLIC_API_URL=https://staging-api.com pnpm dev
```

No rebuild required - the new value is picked up immediately! :::

## What's Next?

Each example includes:

- Complete, copy-paste-ready code
- Real-world scenarios (feature flags, API configuration, theming)
- Docker deployment examples
- Middleware integration
- Type-safe environment access patterns
- Common gotchas and best practices

Pick the approach that fits your needs and explore the full examples to see `next-dynenv` in action.
