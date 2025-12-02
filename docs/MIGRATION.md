# Migration Guide (v4.x)

This guide helps you migrate to `@hyperb1iss/next-runtime-env@4.x`, which supports Next.js 15 and React 19.

## About This Fork

> **Important:** `@hyperb1iss/next-runtime-env` is a fork of the original
> [expatfile/next-runtime-env](https://github.com/expatfile/next-runtime-env) project, which appears to be unmaintained.
> This fork starts at version **4.0.0** to clearly differentiate from the original project while maintaining API
> compatibility.

### Version Timeline

- **v4.x (this fork):** Supports Next.js 15 & React 19 with modern async server components
- **v3.x and below (original project):** Supports older Next.js versions but is no longer maintained

## Migrating from Original next-runtime-env

If you're coming from the original `next-runtime-env` package (v3.x or earlier), the migration is straightforward:

### Step 1: Update Package Name

The primary change is the package name. Update your `package.json`:

**Before:**

```json
{
    "dependencies": {
        "next-runtime-env": "^3.x.x"
    }
}
```

**After:**

```json
{
    "dependencies": {
        "@hyperb1iss/next-runtime-env": "^4.0.0"
    }
}
```

### Step 2: Update Imports

Update all import statements in your codebase:

**Before:**

```tsx
import { PublicEnvScript } from 'next-runtime-env'
import { env } from 'next-runtime-env'
```

**After:**

```tsx
import { PublicEnvScript } from '@hyperb1iss/next-runtime-env'
import { env } from '@hyperb1iss/next-runtime-env'
```

### Step 3: Update Next.js and React (if needed)

If you're still on Next.js 14, upgrade to Next.js 15:

```bash
npm install next@latest react@latest react-dom@latest @hyperb1iss/next-runtime-env@latest
# or
pnpm update next react react-dom && pnpm add @hyperb1iss/next-runtime-env
```

### Step 4: No Code Changes Required! 🎉

The public API remains **100% compatible**. All components (`PublicEnvScript`, `PublicEnvProvider`) and utility
functions (`env()`) work exactly as before.

## Breaking Changes from v3.x to v4.x

**Good news:** There are **no breaking API changes** between v3.x and v4.x!

The migration from the original `next-runtime-env@3.x` to `@hyperb1iss/next-runtime-env@4.x` requires only:

1. Changing the package name
2. Updating import statements
3. Upgrading to Next.js 15 and React 19 (if not already on these versions)

All existing code using the library will continue to work without modification.

## New Features in v4.x

v4.x adds several new features while maintaining backwards compatibility:

### Default Values

The `env()` function now accepts an optional default value:

```tsx
import { env } from '@hyperb1iss/next-runtime-env'

const apiUrl = env('NEXT_PUBLIC_API_URL', 'https://api.default.com')
```

### Required Environment Variables

Use `requireEnv()` for variables that must be defined:

```tsx
import { requireEnv } from '@hyperb1iss/next-runtime-env'

// Throws if undefined
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL')
```

### Type-Safe Parsers

Convert environment strings to typed values:

```tsx
import { envParsers } from '@hyperb1iss/next-runtime-env'

const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG')
const port = envParsers.number('NEXT_PUBLIC_PORT', 3000)
const features = envParsers.array('NEXT_PUBLIC_FEATURES')
const config = envParsers.json<Config>('NEXT_PUBLIC_CONFIG')
const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL')
const appEnv = envParsers.enum('NEXT_PUBLIC_ENV', ['development', 'staging', 'production'])
```

### Enhanced Security

- **XSS Protection:** All injected values are JSON-escaped
- **Immutability:** Runtime values are wrapped with `Object.freeze()`

## Upgrading to Next.js 15 (Additional Steps)

If you're upgrading from Next.js 14 to Next.js 15 as part of this migration, you may need to update custom code that
uses Next.js dynamic rendering APIs.

### Prerequisites

- Next.js 15.x or higher
- React 19.x or higher
- Node.js 18.x or higher

### Update Custom Dynamic Rendering (If Applicable)

If you were using `unstable_noStore()` in **custom implementations** (not the library's built-in components), update to
Next.js 15 stable APIs:

**Before (Next.js 14):**

```tsx
import { unstable_noStore as noStore } from 'next/cache'

export default function CustomLayout({ children }) {
    noStore() // Opt into dynamic rendering

    const customEnv = getCustomEnv()
    return <div>{children}</div>
}
```

**After (Next.js 15+):**

```tsx
import { connection } from 'next/server'

export default async function CustomLayout({ children }) {
    // Opt into dynamic rendering (Next.js 15+)
    await connection()

    const customEnv = getCustomEnv()
    return <div>{children}</div>
}
```

**Alternative approach using `headers()`:**

```tsx
import { headers } from 'next/headers'

export function getCustomEnv() {
    // Force dynamic rendering by accessing headers
    headers()

    return process.env.CUSTOM_VAR
}
```

### What Changed Under the Hood

The library now uses Next.js 15/16's stable dynamic rendering APIs:

- `PublicEnvScript` and `EnvScript` use `headers()` for nonce retrieval (when configured)
- The `env()` utility reads from `process.env` (server) or `window.__ENV` (client) directly
- Script injection includes XSS protection and `Object.freeze()` for immutability

### Troubleshooting

**Issue: "Cannot find module 'next/server'"**

Make sure you've upgraded to Next.js 15:

```bash
npm list next
```

**Issue: Build errors about async components**

Ensure you're using React 19:

```bash
npm list react react-dom
```

**Issue: Environment variables not updating at runtime**

Verify your Next.js config has `output: 'standalone'` if deploying in standalone mode:

```js
// next.config.js
module.exports = {
    output: 'standalone',
}
```

## Upgrading from v2.x (Original Project)

If you're upgrading from the original `next-runtime-env@2.x` (Next.js 13):

1. Update to the new package: `@hyperb1iss/next-runtime-env@4.x`
2. Follow the package name and import updates above
3. Upgrade to Next.js 15 and React 19
4. Review the [Next.js 15 upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading) for
   framework-specific breaking changes
5. Test your application thoroughly

## Upgrading from v1.x (Pages Router - Original Project)

If you're still using the original `next-runtime-env@1.x` with the Pages Router:

1. Consider migrating to the App Router first (see
   [Next.js migration guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration))
2. Then follow the migration steps above to move to `@hyperb1iss/next-runtime-env@4.x`
3. Alternative: Continue using `next-runtime-env@1.x` for Pages Router support (note: unmaintained)

## Version Compatibility Matrix

### This Fork (Maintained)

| Package                      | Version | Next.js    | React | Notes                                          |
| ---------------------------- | ------- | ---------- | ----- | ---------------------------------------------- |
| @hyperb1iss/next-runtime-env | 4.x     | 15.x, 16.x | 19.x  | Next.js 15/16 & React 19 with async components |

### Original Project (Unmaintained)

| Package          | Version | Next.js     | React       | Notes                           |
| ---------------- | ------- | ----------- | ----------- | ------------------------------- |
| next-runtime-env | 3.x     | 14.x        | 18.x        | App Router with caching support |
| next-runtime-env | 2.x     | 13.x        | 18.x        | App Router                      |
| next-runtime-env | 1.x     | 12.x - 13.x | 17.x - 18.x | Pages Router only               |

## Quick Migration Checklist

Use this checklist for a smooth migration from the original `next-runtime-env`:

- [ ] Install `@hyperb1iss/next-runtime-env@4.x`
- [ ] Remove old `next-runtime-env` package
- [ ] Update all imports to use `@hyperb1iss/next-runtime-env`
- [ ] Upgrade to Next.js 15 and React 19 (if not already)
- [ ] Update any custom `unstable_noStore()` usage to Next.js 15 APIs
- [ ] Test environment variable loading in development
- [ ] Test environment variable loading in production/standalone builds
- [ ] Verify runtime environment variable updates work as expected

## Need Help?

- Check the [examples](../examples/) for working implementations
- Review the [main documentation](../README.md)
- Read the [Next.js 15 upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading)
- [Open an issue](https://github.com/hyperb1iss/next-runtime-env/issues) on GitHub

## Additional Resources

- [Exposing Custom Environment Variables](EXPOSING_CUSTOM_ENV.md)
- [Making Environment Variables Public](MAKING_ENV_PUBLIC.md)
- [Original next-runtime-env repository](https://github.com/expatfile/next-runtime-env) (unmaintained)
