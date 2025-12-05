# App Router with Context Approach

Complete example using `PublicEnvProvider` for React Context-based environment access.

## Project Structure

```
app/
├── layout.tsx          # Root layout with PublicEnvProvider
├── page.tsx            # Server component
├── components/
│   ├── EnvDisplay.tsx  # Client component using useEnvContext
│   └── ConfigPanel.tsx # Configuration panel
└── api/
    └── config/
        └── route.ts    # API route
```

## Setup

### 1. Root Layout

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <PublicEnvProvider>{children}</PublicEnvProvider>
            </body>
        </html>
    )
}
```

### 2. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=My App
NEXT_PUBLIC_THEME=dark
NEXT_PUBLIC_FEATURES=auth,dashboard,settings
SECRET_API_KEY=sk_secret_123
```

## Components

### Server Component

```tsx
// app/page.tsx
import { env } from 'next-dynenv'
import { EnvDisplay } from './components/EnvDisplay'
import { ConfigPanel } from './components/ConfigPanel'

export default function Home() {
    // Server can access all variables
    const apiUrl = env('NEXT_PUBLIC_API_URL')

    return (
        <main>
            <h1>Context Approach Demo</h1>

            <section>
                <h2>Server Rendered</h2>
                <p>API URL: {apiUrl}</p>
            </section>

            <section>
                <h2>Client Components</h2>
                <EnvDisplay />
                <ConfigPanel />
            </section>
        </main>
    )
}
```

### Client Component with Hook

```tsx
// app/components/EnvDisplay.tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function EnvDisplay() {
    const env = useEnvContext()

    return (
        <div>
            <h3>Environment Variables</h3>
            <dl>
                <dt>API URL</dt>
                <dd>{env.NEXT_PUBLIC_API_URL ?? 'Not set'}</dd>

                <dt>App Name</dt>
                <dd>{env.NEXT_PUBLIC_APP_NAME ?? 'Not set'}</dd>

                <dt>Theme</dt>
                <dd>{env.NEXT_PUBLIC_THEME ?? 'Not set'}</dd>
            </dl>
        </div>
    )
}
```

### Destructured Access

```tsx
// app/components/ConfigPanel.tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function ConfigPanel() {
    const { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_THEME, NEXT_PUBLIC_FEATURES } = useEnvContext()

    // Parse features array
    const features = NEXT_PUBLIC_FEATURES?.split(',') ?? []

    return (
        <div className={`config-panel theme-${NEXT_PUBLIC_THEME ?? 'light'}`}>
            <h3>{NEXT_PUBLIC_APP_NAME} Configuration</h3>

            <div>
                <strong>API Endpoint:</strong>
                <code>{NEXT_PUBLIC_API_URL}</code>
            </div>

            <div>
                <strong>Active Features:</strong>
                <ul>
                    {features.map((feature) => (
                        <li key={feature}>{feature}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
```

### Custom Hook for Typed Access

```tsx
// hooks/useTypedEnv.ts
'use client'

import { useEnvContext } from 'next-dynenv'

interface TypedEnv {
    apiUrl: string
    appName: string
    theme: 'light' | 'dark'
    features: string[]
    debug: boolean
}

export function useTypedEnv(): TypedEnv {
    const env = useEnvContext()

    return {
        apiUrl: env.NEXT_PUBLIC_API_URL ?? '',
        appName: env.NEXT_PUBLIC_APP_NAME ?? 'App',
        theme: (env.NEXT_PUBLIC_THEME as 'light' | 'dark') ?? 'light',
        features: env.NEXT_PUBLIC_FEATURES?.split(',') ?? [],
        debug: env.NEXT_PUBLIC_DEBUG === 'true',
    }
}
```

Using the typed hook:

```tsx
// app/components/TypedComponent.tsx
'use client'

import { useTypedEnv } from '@/hooks/useTypedEnv'

export function TypedComponent() {
    const { apiUrl, appName, theme, features, debug } = useTypedEnv()

    return (
        <div className={`app theme-${theme}`}>
            <h1>{appName}</h1>
            <p>Connecting to: {apiUrl}</p>
            {debug && <p>Debug mode enabled</p>}
            <p>Features: {features.join(', ')}</p>
        </div>
    )
}
```

## Combining with Other Providers

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/providers/AuthProvider'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <PublicEnvProvider>
                    <ThemeProvider>
                        <AuthProvider>{children}</AuthProvider>
                    </ThemeProvider>
                </PublicEnvProvider>
            </body>
        </html>
    )
}
```

## Custom EnvProvider Example

For fine-grained control:

```tsx
// app/layout.tsx
import { EnvProvider } from 'next-dynenv'

export default async function RootLayout({ children }) {
    // Custom environment logic
    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL,
        NEXT_PUBLIC_APP_NAME: process.env.APP_NAME,
        NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
        NEXT_PUBLIC_VERSION: process.env.npm_package_version,
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

## Error Boundary

Handle missing provider:

```tsx
// app/components/SafeEnvDisplay.tsx
'use client'

import { useEnvContext } from 'next-dynenv'

export function SafeEnvDisplay() {
    try {
        const env = useEnvContext()
        return <div>API: {env.NEXT_PUBLIC_API_URL}</div>
    } catch (error) {
        return <div className="error">Error: Component must be wrapped in PublicEnvProvider</div>
    }
}
```

## Running Locally

```bash
# Clone the repo
git clone https://github.com/hyperb1iss/next-dynenv.git
cd next-dynenv/examples/with-app-router-context

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the example in action.

## When to Choose Context Approach

Use the context approach when:

- Your app is purely React
- You prefer React patterns over globals
- You want to leverage React DevTools
- You need to nest or override environments

## Comparison with Script Approach

| Feature             | Context           | Script  |
| ------------------- | ----------------- | ------- |
| Access method       | `useEnvContext()` | `env()` |
| Works outside React | No                | Yes     |
| React DevTools      | Yes               | No      |
| Setup complexity    | Similar           | Similar |

## Key Points

1. **PublicEnvProvider in body** - Wraps children with Context
2. **useEnvContext hook** - Access env in any client component
3. **Typed access** - Create custom hooks for type safety
4. **Composable** - Works with other React providers
5. **Pure React** - No global window pollution
