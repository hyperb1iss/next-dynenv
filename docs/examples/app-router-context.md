# App Router with Context Approach

The Context approach uses React Context to provide environment variables through the React component tree. This is
perfect for React-first applications that want to leverage React's ecosystem and patterns.

## Why Choose the Context Approach?

- **React-first design** - Leverages familiar React Context patterns
- **React DevTools visibility** - Inspect environment values in DevTools
- **Type-safe with custom hooks** - Create strongly-typed environment accessors
- **Composable** - Nest providers for environment overrides in subtrees
- **Zero global pollution** - No `window.__ENV` object

::: warning Limitation The Context approach only works in **React components**. It cannot be used in middleware, API
routes outside components, or vanilla JavaScript. If you need environment variables in these places, use the
[Script Approach](/examples/app-router-script) instead. :::

## Project Structure

This example demonstrates React Context patterns:

```
app/
├── layout.tsx               # Root layout with PublicEnvProvider
├── page.tsx                 # Server component
├── components/
│   ├── EnvDisplay.tsx       # Basic context usage
│   ├── ConfigPanel.tsx      # Destructured context access
│   └── TypedComponent.tsx   # Using custom typed hook
├── hooks/
│   └── useTypedEnv.ts       # Type-safe environment hook
└── api/
    └── config/
        └── route.ts         # API route (uses env(), not context)
```

## Setup

### 1. Installation

```bash
npm install next-dynenv
# or
pnpm add next-dynenv
# or
yarn add next-dynenv
```

### 2. Root Layout Setup

Wrap your application with `PublicEnvProvider` in the root layout's `<body>`.

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'
import type { ReactNode } from 'react'

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

::: info Provider Placement Unlike the Script approach which goes in `<head>`, the `PublicEnvProvider` wraps your
content in the `<body>`. This is because it uses React Context, which needs to be part of the component tree. :::

### 3. Environment Variables

Create a `.env.local` file:

```bash
# .env.local

# Public variables (accessible to client-side code)
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=My App
NEXT_PUBLIC_THEME=dark
NEXT_PUBLIC_FEATURES=auth,dashboard,settings
NEXT_PUBLIC_VERSION=1.0.0

# Server-only secrets (NOT accessible to client)
SECRET_API_KEY=sk_secret_123
DATABASE_URL=postgres://localhost:5432/mydb
```

::: tip Variable Naming Only variables prefixed with `NEXT_PUBLIC_` are accessible via the context. Server-only
variables remain secure on the server. :::

## Real-World Usage Examples

### Server Component

Server components **don't use the context** - they use the `env()` function directly. The context is only for client
components.

```tsx
// app/page.tsx
import { env } from 'next-dynenv'
import { EnvDisplay } from './components/EnvDisplay'
import { ConfigPanel } from './components/ConfigPanel'
import { TypedComponent } from './components/TypedComponent'

export default function Home() {
    // Server components use env() directly, not useEnvContext()
    const apiUrl = env('NEXT_PUBLIC_API_URL')
    const appName = env('NEXT_PUBLIC_APP_NAME', 'My App')

    // Check server-side secrets
    const hasSecretKey = !!env('SECRET_API_KEY')
    const hasDatabase = !!env('DATABASE_URL')

    return (
        <main className="container">
            <h1>{appName}</h1>
            <p>React Context Approach Demo</p>

            {/* Server-rendered section */}
            <section className="server-section">
                <h2>Server Component</h2>
                <p>
                    Uses <code>env()</code> function directly
                </p>
                <p>
                    API Endpoint: <code>{apiUrl}</code>
                </p>

                <div className="status">
                    <p>API Key: {hasSecretKey ? '✓ Configured' : '✗ Missing'}</p>
                    <p>Database: {hasDatabase ? '✓ Connected' : '✗ Not configured'}</p>
                </div>
            </section>

            {/* Client components using context */}
            <section className="client-section">
                <h2>Client Components</h2>
                <p>
                    Use <code>useEnvContext()</code> hook
                </p>

                <EnvDisplay />
                <ConfigPanel />
                <TypedComponent />
            </section>
        </main>
    )
}
```

::: tip Server vs Client **Server components** use `env()` directly. **Client components** use the `useEnvContext()`
hook. The provider makes environment variables available to the React tree. :::

### Client Component with Hook

The `useEnvContext()` hook returns an object with all `NEXT_PUBLIC_*` environment variables.

```tsx
// app/components/EnvDisplay.tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function EnvDisplay() {
    // Get the entire environment object
    const env = useEnvContext()

    return (
        <div className="env-display">
            <h3>Environment Variables</h3>
            <p className="description">
                Accessed via <code>useEnvContext()</code> hook
            </p>

            <dl className="env-list">
                <dt>API URL</dt>
                <dd>
                    <code>{env.NEXT_PUBLIC_API_URL ?? 'Not set'}</code>
                </dd>

                <dt>App Name</dt>
                <dd>{env.NEXT_PUBLIC_APP_NAME ?? 'Not set'}</dd>

                <dt>Theme</dt>
                <dd>
                    <span className={`theme-badge theme-${env.NEXT_PUBLIC_THEME ?? 'light'}`}>
                        {env.NEXT_PUBLIC_THEME ?? 'light'}
                    </span>
                </dd>

                <dt>Version</dt>
                <dd>{env.NEXT_PUBLIC_VERSION ?? '0.0.0'}</dd>
            </dl>

            {/* Inspect the whole env object */}
            <details>
                <summary>View all environment variables</summary>
                <pre>{JSON.stringify(env, null, 2)}</pre>
            </details>
        </div>
    )
}
```

::: tip Context Object The context returns a plain object with all public environment variables. You can destructure it,
pass it to other components, or inspect it in React DevTools. :::

### Destructured Access Pattern

You can destructure specific variables from the context for cleaner code.

```tsx
// app/components/ConfigPanel.tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function ConfigPanel() {
    // Destructure only what you need
    const { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_THEME, NEXT_PUBLIC_FEATURES } = useEnvContext()

    // Parse and process values
    const features = NEXT_PUBLIC_FEATURES?.split(',') ?? []
    const theme = NEXT_PUBLIC_THEME ?? 'light'
    const apiHost = NEXT_PUBLIC_API_URL ? new URL(NEXT_PUBLIC_API_URL).host : 'unknown'

    return (
        <div className={`config-panel theme-${theme}`}>
            <h3>{NEXT_PUBLIC_APP_NAME ?? 'Application'} Configuration</h3>

            <div className="config-section">
                <h4>API Configuration</h4>
                <div className="config-item">
                    <span className="label">Endpoint:</span>
                    <code>{NEXT_PUBLIC_API_URL ?? 'Not configured'}</code>
                </div>
                <div className="config-item">
                    <span className="label">Host:</span>
                    <span>{apiHost}</span>
                </div>
            </div>

            <div className="config-section">
                <h4>Active Features</h4>
                {features.length > 0 ? (
                    <ul className="features-list">
                        {features.map((feature) => (
                            <li key={feature} className="feature-item">
                                <span className="feature-icon">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-state">No features enabled</p>
                )}
            </div>

            <div className="config-section">
                <h4>Theme Settings</h4>
                <p>
                    Current theme: <strong>{theme}</strong>
                </p>
                <div className={`theme-preview ${theme}`}>Theme preview</div>
            </div>
        </div>
    )
}
```

::: info Destructuring Benefits Destructuring makes it clear which variables your component depends on and provides
cleaner variable names without the `NEXT_PUBLIC_` prefix in your component logic. :::

### Custom Hook for Type-Safe Access

Create a custom hook to enforce type safety and provide a cleaner API for your components.

```tsx
// hooks/useTypedEnv.ts
'use client'

import { useEnvContext } from 'next-dynenv'

/**
 * Application environment configuration
 * Strongly typed for better IDE support and runtime safety
 */
interface TypedEnv {
    apiUrl: string
    appName: string
    theme: 'light' | 'dark'
    features: string[]
    version: string
    debug: boolean
}

/**
 * Type-safe environment hook
 * Transforms raw string environment variables into proper types
 */
export function useTypedEnv(): TypedEnv {
    const env = useEnvContext()

    return {
        apiUrl: env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
        appName: env.NEXT_PUBLIC_APP_NAME ?? 'My App',
        theme: (env.NEXT_PUBLIC_THEME as 'light' | 'dark') ?? 'light',
        features: env.NEXT_PUBLIC_FEATURES?.split(',').map((f) => f.trim()) ?? [],
        version: env.NEXT_PUBLIC_VERSION ?? '0.0.0',
        debug: env.NEXT_PUBLIC_DEBUG === 'true',
    }
}
```

Using the typed hook in components:

```tsx
// app/components/TypedComponent.tsx
'use client'

import { useTypedEnv } from '@/hooks/useTypedEnv'

export function TypedComponent() {
    // Get fully typed, parsed environment variables
    const { apiUrl, appName, theme, features, version, debug } = useTypedEnv()

    // TypeScript knows the exact types!
    // theme is 'light' | 'dark', not string
    // features is string[], not string | undefined
    // debug is boolean, not string

    return (
        <div className={`app theme-${theme}`}>
            <header>
                <h1>{appName}</h1>
                <span className="version">v{version}</span>
            </header>

            <div className="api-status">
                <p>
                    API: <code>{apiUrl}</code>
                </p>
                {debug && (
                    <div className="debug-info">
                        <p>Debug mode enabled</p>
                        <p>Features: {features.join(', ')}</p>
                    </div>
                )}
            </div>

            <div className="features">
                {features.map((feature) => (
                    <div key={feature} className="feature-card">
                        {feature}
                    </div>
                ))}
            </div>
        </div>
    )
}
```

::: tip Best Practice Creating a typed hook is the recommended approach for production applications. It provides:

- **Type safety** - Catch errors at compile time
- **Single source of truth** - Environment parsing logic in one place
- **Better DX** - IDE autocomplete and inline documentation
- **Easier testing** - Mock the hook instead of raw environment variables :::

## Advanced Patterns

### Composing with Other Providers

The Context approach composes naturally with other React providers in your application.

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { AnalyticsProvider } from '@/providers/AnalyticsProvider'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                {/* Environment provider at the root */}
                <PublicEnvProvider>
                    {/* Theme provider can access environment */}
                    <ThemeProvider>
                        {/* Auth provider can access environment and theme */}
                        <AuthProvider>
                            {/* Analytics provider can access everything above */}
                            <AnalyticsProvider>{children}</AnalyticsProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </PublicEnvProvider>
            </body>
        </html>
    )
}
```

Example of a provider that uses environment context:

```tsx
// providers/ThemeProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useEnvContext } from 'next-dynenv'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
    theme: Theme
    setTheme: (theme: Theme) => void
}>({
    theme: 'light',
    setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Get default theme from environment
    const env = useEnvContext()
    const defaultTheme = (env.NEXT_PUBLIC_THEME as Theme) ?? 'light'

    const [theme, setTheme] = useState<Theme>(defaultTheme)

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
```

::: info Provider Composition Since `PublicEnvProvider` is a React Context, it composes perfectly with your existing
provider architecture. Child providers can use `useEnvContext()` to access environment configuration. :::

### Custom EnvProvider for Full Control

For advanced scenarios, use `EnvProvider` directly to customize which variables are exposed or add computed values.

```tsx
// app/layout.tsx
import { EnvProvider } from 'next-dynenv'
import type { ReactNode } from 'react'

export default async function RootLayout({ children }: { children: ReactNode }) {
    // Build custom environment object
    const customEnv = {
        // Map from different variable names
        NEXT_PUBLIC_API_URL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_APP_NAME: process.env.APP_NAME || 'My App',

        // Add computed values
        NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
        NEXT_PUBLIC_VERSION: process.env.npm_package_version || '1.0.0',
        NEXT_PUBLIC_GIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',

        // Feature detection
        NEXT_PUBLIC_HAS_AUTH: process.env.AUTH_SECRET ? 'true' : 'false',
        NEXT_PUBLIC_HAS_DATABASE: process.env.DATABASE_URL ? 'true' : 'false',
    }

    return (
        <html lang="en">
            <body>
                <EnvProvider env={customEnv}>{children}</EnvProvider>
            </body>
        </html>
    )
}
```

::: tip Use Cases for Custom Provider

- **Variable mapping** - Expose server variables with different names
- **Computed values** - Add build time, git SHA, or other metadata
- **Feature detection** - Derive flags from server configuration
- **Testing** - Inject mock environment for testing

### Error Handling Pattern

Handle missing provider gracefully in components:

```tsx
// app/components/SafeEnvDisplay.tsx
'use client'

import { useEnvContext } from 'next-dynenv'
import { useEffect, useState } from 'react'

export function SafeEnvDisplay() {
    const [error, setError] = useState<string | null>(null)
    const [env, setEnv] = useState<Record<string, string | undefined> | null>(null)

    useEffect(() => {
        try {
            const envData = useEnvContext()
            setEnv(envData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }, [])

    if (error) {
        return (
            <div className="error-state">
                <h3>Configuration Error</h3>
                <p>{error}</p>
                <p className="hint">Make sure this component is wrapped in PublicEnvProvider</p>
            </div>
        )
    }

    if (!env) {
        return <div>Loading environment...</div>
    }

    return (
        <div className="env-display">
            <h3>Environment</h3>
            <p>API: {env.NEXT_PUBLIC_API_URL ?? 'Not configured'}</p>
        </div>
    )
}
```

::: warning Provider Required If you use `useEnvContext()` outside of a `PublicEnvProvider`, it will throw an error.
Always ensure your components are wrapped in the provider or handle the error gracefully. :::

## Running the Example Locally

### Quick Start

```bash
# Clone the repository
git clone https://github.com/hyperb1iss/next-dynenv.git
cd next-dynenv/examples/with-app-router-context

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the example running.

### Testing Different Configurations

Try changing environment variables:

```bash
# Test with different theme
NEXT_PUBLIC_THEME=dark \
NEXT_PUBLIC_APP_NAME="Dark Mode App" \
pnpm dev

# Test with custom features
NEXT_PUBLIC_FEATURES=auth,dashboard,settings,admin \
pnpm dev
```

### Inspecting with React DevTools

1. Install [React DevTools](https://react.dev/learn/react-developer-tools)
2. Open DevTools in your browser
3. Find the `EnvProvider.Provider` component in the tree
4. Inspect the context value to see all environment variables

This is a unique advantage of the Context approach - full visibility into environment state within React's tooling.

## When to Choose the Context Approach

Choose the Context approach when:

- **Your app is purely React** - No middleware or vanilla JavaScript integration needed
- **You prefer React patterns** - Familiar Context API instead of global variables
- **You want DevTools visibility** - Inspect environment in React DevTools
- **You need composability** - Nest providers or override values in subtrees
- **You're building a design system** - Components can declare environment dependencies

Don't choose Context if:

- You need environment variables in **middleware** (use Script approach)
- You're integrating with **third-party libraries** that need config before React
- You prefer **simpler, universal access** (use Script approach)

## Script vs Context Comparison

| Feature                 | Context Approach          | Script Approach           |
| ----------------------- | ------------------------- | ------------------------- |
| **Access method**       | `useEnvContext()` hook    | `env()` function          |
| **Works in middleware** | ❌ No                     | ✅ Yes                    |
| **Works outside React** | ❌ No                     | ✅ Yes                    |
| **React DevTools**      | ✅ Yes                    | ❌ No                     |
| **Global scope**        | ❌ No (clean)             | ✅ Yes (window.\_\_ENV)   |
| **Type safety**         | ✅ Easy with custom hooks | ⚠️ Manual with envParsers |
| **Provider nesting**    | ✅ Yes                    | ❌ No                     |
| **Setup complexity**    | Similar                   | Similar                   |
| **Best for**            | React-only apps           | Universal apps            |

## Key Takeaways

### Why This Approach Works

1. **React-first design** - Leverages familiar Context patterns
2. **Type-safe custom hooks** - Create strongly-typed environment accessors
3. **Composable architecture** - Nest providers and integrate with existing Context providers
4. **DevTools visibility** - Debug environment configuration in React DevTools
5. **No global pollution** - Clean, scoped access without `window.__ENV`

### Common Patterns

- **Custom typed hooks** - Wrap `useEnvContext()` with type-safe parsing
- **Provider composition** - Use environment in other providers (theme, auth, etc.)
- **Destructured access** - Clean variable names without `NEXT_PUBLIC_` prefix
- **Error boundaries** - Handle missing provider gracefully
- **Testing** - Mock context provider for isolated component tests

### Best Practices

- **Create a typed hook** for production apps (`useTypedEnv`)
- **Place provider at root** to ensure all components have access
- **Compose with other providers** for integrated configuration
- **Handle missing provider** with error boundaries or try/catch
- **Document environment dependencies** in component PropTypes/interfaces

## Next Steps

- Compare with the [Script Approach](/examples/app-router-script) for universal access
- Review the [API Reference](/api/) for complete documentation
- Explore the [Security Guide](/guide/security) for best practices

::: tip Production Ready This pattern is used in production React applications. The custom typed hook pattern is
especially recommended for large applications with complex environment needs. :::
