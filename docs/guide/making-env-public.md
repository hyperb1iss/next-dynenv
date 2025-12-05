# Making Environment Variables Public

Use `makeEnvPublic()` to expose existing variables without renaming them.

## The Problem

You have environment variables without the `NEXT_PUBLIC_` prefix:

```bash
API_URL=https://api.example.com
APP_NAME=MyApp
FEATURE_FLAG=true
```

But you want them available in the browser without changing their names everywhere.

## The Solution

Use `makeEnvPublic()` to create prefixed copies:

```js
// next.config.js
const { makeEnvPublic } = require('next-dynenv')

// Creates NEXT_PUBLIC_API_URL from API_URL
makeEnvPublic('API_URL')

module.exports = {
    // your config
}
```

Now `API_URL` remains available as-is on the server, and `NEXT_PUBLIC_API_URL` is available in the browser.

## Basic Usage

### Single Variable

```js
// next.config.js
const { makeEnvPublic } = require('next-dynenv')

makeEnvPublic('API_URL')
// API_URL → NEXT_PUBLIC_API_URL
```

### Multiple Variables

```js
// next.config.js
const { makeEnvPublic } = require('next-dynenv')

makeEnvPublic(['API_URL', 'APP_NAME', 'VERSION'])
// API_URL → NEXT_PUBLIC_API_URL
// APP_NAME → NEXT_PUBLIC_APP_NAME
// VERSION → NEXT_PUBLIC_VERSION
```

## Usage in Next.js Config

```js
// next.config.js
const { makeEnvPublic } = require('next-dynenv')

// Make variables public BEFORE the config export
makeEnvPublic(['API_URL', 'APP_NAME', 'ANALYTICS_ID', 'FEATURE_FLAGS'])

/** @type {import('next').NextConfig} */
const nextConfig = {
    // your Next.js configuration
}

module.exports = nextConfig
```

## With ESM Syntax

```js
// next.config.mjs
import { makeEnvPublic } from 'next-dynenv'

makeEnvPublic(['API_URL', 'APP_NAME'])

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig
```

## Controlling Logging

### Default Logging

By default, `makeEnvPublic` logs events:

```
[next-dynenv] Prefixed environment variable 'API_URL'
[next-dynenv] Prefixed environment variable 'APP_NAME'
```

### Silent Mode

```js
makeEnvPublic('API_URL', { logLevel: 'silent' })
```

### Production-Only Silence

```js
makeEnvPublic(['API_URL', 'APP_NAME'], {
    logLevel: process.env.NODE_ENV === 'production' ? 'silent' : 'info',
})
```

## Behavior Details

### Missing Variables

If a variable doesn't exist, a warning is logged (but no error thrown):

```js
// If MISSING_VAR is not in process.env
makeEnvPublic('MISSING_VAR')
// Warning: "Skipped prefixing environment variable 'MISSING_VAR'. Variable not in process.env"
```

### Already Public Variables

If a variable already has the prefix, it's skipped:

```js
makeEnvPublic('NEXT_PUBLIC_API_URL')
// Warning: "Environment variable 'NEXT_PUBLIC_API_URL' is already public"
```

### Original Variables Preserved

The original variable remains available:

```js
makeEnvPublic('API_URL')

// Both are now available:
process.env.API_URL // Original
process.env.NEXT_PUBLIC_API_URL // Copy (for browser)
```

## Using with instrumentation.ts

For Next.js 13.2+, you can use the instrumentation file:

```ts
// instrumentation.ts
import { makeEnvPublic } from 'next-dynenv'

export function register() {
    makeEnvPublic(['API_URL', 'APP_NAME', 'REGION'])
}
```

## Complete Example

```js
// next.config.js
const { makeEnvPublic } = require('next-dynenv')

// Environment variables to expose
const publicVars = ['API_URL', 'APP_NAME', 'VERSION', 'ANALYTICS_ID', 'FEATURE_AUTH', 'FEATURE_PAYMENTS']

// Make them public
makeEnvPublic(publicVars, {
    logLevel: process.env.NODE_ENV === 'production' ? 'silent' : 'info',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
}

module.exports = nextConfig
```

Then in your components:

```tsx
import { env } from 'next-dynenv'

// These now work in both server and client
const apiUrl = env('NEXT_PUBLIC_API_URL')
const appName = env('NEXT_PUBLIC_APP_NAME')
```

## When to Use

Use `makeEnvPublic()` when:

- You have existing env vars without the `NEXT_PUBLIC_` prefix
- You want to avoid renaming variables in your deployment config
- You're migrating from another framework
- You prefer keeping env var names consistent across services

## Next Steps

- [Custom Variables](/guide/custom-variables) - More control over variables
- [Docker Deployment](/guide/docker) - Container deployment patterns
- [API Reference](/api/) - Full API documentation
