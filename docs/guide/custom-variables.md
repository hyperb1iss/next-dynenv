# Custom Variables

Fine-grained control over exactly which environment variables reach the client.

## Overview

`PublicEnvScript` and `PublicEnvProvider` automatically expose all `NEXT_PUBLIC_*` variables—which is great for most
apps. But sometimes you need more control:

- **Whitelist** - Expose only specific variables
- **Transform** - Rename or modify variables before exposing them
- **Compute** - Generate values dynamically at request time
- **Filter** - Exclude certain variables based on conditions

## Using EnvScript

`EnvScript` accepts a custom environment object:

```tsx
import { EnvScript } from 'next-dynenv'

export default function Layout({ children }) {
    // Only expose specific variables
    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL,
        NEXT_PUBLIC_APP_NAME: process.env.APP_NAME,
    }

    return (
        <html>
            <head>
                <EnvScript env={customEnv} />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

## Using EnvProvider

For the context approach:

```tsx
import { EnvProvider } from 'next-dynenv'

export default function Layout({ children }) {
    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL,
        NEXT_PUBLIC_FEATURE_FLAG: process.env.FEATURE_FLAG,
    }

    return (
        <html>
            <body>
                <EnvProvider env={customEnv}>{children}</EnvProvider>
            </body>
        </html>
    )
}
```

## Variable Transformation

### Renaming Variables

```tsx
const customEnv = {
    // Expose API_URL as NEXT_PUBLIC_API_URL
    NEXT_PUBLIC_API_URL: process.env.API_URL,

    // Expose DATABASE_HOST as NEXT_PUBLIC_DB_HOST
    NEXT_PUBLIC_DB_HOST: process.env.DATABASE_HOST,
}
```

### Computing Values

```tsx
const customEnv = {
    NEXT_PUBLIC_API_URL: process.env.API_URL,

    // Computed value
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),

    // Conditional value
    NEXT_PUBLIC_DEBUG: process.env.NODE_ENV === 'development' ? 'true' : 'false',
}
```

### Environment-Specific Values

```tsx
const getEnvConfig = () => {
    const env = process.env.NODE_ENV

    if (env === 'production') {
        return {
            NEXT_PUBLIC_API_URL: process.env.PROD_API_URL,
            NEXT_PUBLIC_ANALYTICS_ID: process.env.PROD_ANALYTICS_ID,
        }
    }

    return {
        NEXT_PUBLIC_API_URL: process.env.DEV_API_URL || 'http://localhost:8080',
        NEXT_PUBLIC_ANALYTICS_ID: '', // Disabled in dev
    }
}

;<EnvScript env={getEnvConfig()} />
```

## Request-Time Variables

Access request-specific data in server components:

```tsx
import { headers } from 'next/headers'
import { EnvScript } from 'next-dynenv'

export default async function Layout({ children }) {
    const headersList = await headers()

    const customEnv = {
        NEXT_PUBLIC_API_URL: process.env.API_URL,

        // Request-specific values
        NEXT_PUBLIC_REQUEST_ID: headersList.get('x-request-id'),
        NEXT_PUBLIC_USER_REGION: headersList.get('x-user-region') || 'unknown',
    }

    return (
        <html>
            <head>
                <EnvScript env={customEnv} />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

## Filtering Variables

### Include List

```tsx
const ALLOWED_VARS = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_VERSION',
]

const filteredEnv = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key]) => ALLOWED_VARS.includes(key))
)

<EnvScript env={filteredEnv} />
```

### Exclude List

```tsx
const EXCLUDED_VARS = [
  'NEXT_PUBLIC_INTERNAL_KEY',
  'NEXT_PUBLIC_DEBUG_TOKEN',
]

const filteredEnv = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key]) =>
      key.startsWith('NEXT_PUBLIC_') &&
      !EXCLUDED_VARS.includes(key)
    )
)

<EnvScript env={filteredEnv} />
```

## Combining Automatic and Custom

Mix automatic public variables with custom ones:

```tsx
import { getPublicEnv } from 'next-dynenv'
import { EnvScript } from 'next-dynenv'

export default function Layout({ children }) {
    // Get all NEXT_PUBLIC_* variables
    const publicEnv = getPublicEnv()

    // Add custom variables
    const customEnv = {
        ...publicEnv,
        NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
        NEXT_PUBLIC_CUSTOM_VALUE: 'custom',
    }

    return (
        <html>
            <head>
                <EnvScript env={customEnv} />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

## Security Considerations

::: danger Never Expose Secrets Even with custom variables, **never** expose sensitive data to the client. Just because
you _can_ put anything in the custom env object doesn't mean you _should_. :::

```tsx
// ❌ WRONG - Exposes secret to browser
const badEnv = {
    NEXT_PUBLIC_API_KEY: process.env.SECRET_API_KEY, // Never do this!
}

// ✅ CORRECT - Only safe values
const goodEnv = {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME,
}
```

**Rule of thumb:** If it's secret on the server, it stays secret on the server.

## Next Steps

- [Making Env Public](/guide/making-env-public) - Prefix existing variables
- [Security](/guide/security) - Security best practices
- [EnvScript API](/api/components) - Component documentation
