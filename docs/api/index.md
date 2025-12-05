# API Reference

## Core Functions

### env()

Access environment variables isomorphically (server and client).

```tsx
import { env } from 'next-dynenv'

// Basic usage
const apiUrl = env('NEXT_PUBLIC_API_URL')

// With default value
const timeout = env('NEXT_PUBLIC_TIMEOUT', '5000')
```

[Full `env()` documentation →](/api/env)

### requireEnv()

Access environment variables with required validation.

```tsx
import { requireEnv } from 'next-dynenv'

// Throws if undefined
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
// Error: "Required environment variable 'NEXT_PUBLIC_API_URL' is not defined."
```

[Full `requireEnv()` documentation →](/api/require-env)

## Type-Safe Parsers

### envParsers

Convert environment strings to typed values.

```tsx
import { envParsers } from 'next-dynenv'

const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG')
const port = envParsers.number('NEXT_PUBLIC_PORT', 3000)
const features = envParsers.array('NEXT_PUBLIC_FEATURES')
const config = envParsers.json<Config>('NEXT_PUBLIC_CONFIG')
const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const appEnv = envParsers.enum('NEXT_PUBLIC_ENV', ['dev', 'staging', 'prod'])
```

[Full `envParsers` documentation →](/api/parsers)

## Components

### PublicEnvScript

Injects all `NEXT_PUBLIC_*` variables into the browser.

```tsx
import { PublicEnvScript } from 'next-dynenv'

// In app/layout.tsx
;<head>
    <PublicEnvScript />
</head>
```

### EnvScript

Inject custom environment variables.

```tsx
import { EnvScript } from 'next-dynenv'
;<EnvScript
    env={{
        NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API,
        CUSTOM_VAR: process.env.CUSTOM_VAR,
    }}
/>
```

### PublicEnvProvider / EnvProvider

React Context approach for environment variables.

```tsx
import { PublicEnvProvider, useEnvContext } from 'next-dynenv'

// Provider
;<PublicEnvProvider>{children}</PublicEnvProvider>

// Consumer
const { NEXT_PUBLIC_API_URL } = useEnvContext()
```

[Full Components documentation →](/api/components)

## Utilities

### makeEnvPublic()

Make non-prefixed variables available as `NEXT_PUBLIC_*`.

```tsx
// next.config.js
const { makeEnvPublic } = require('next-dynenv')

makeEnvPublic('API_URL')
// API_URL is now available as NEXT_PUBLIC_API_URL
```
