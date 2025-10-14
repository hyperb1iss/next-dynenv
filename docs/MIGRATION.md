# Migration Guide

This guide helps you upgrade your `next-runtime-env` installation to support Next.js 15 and React 19.

## Upgrading from v3.x to Current (Next.js 15)

### Overview

Version 3.x now supports both Next.js 14 and Next.js 15. The migration is straightforward as the public API remains unchanged.

### Prerequisites

- Next.js 15.x or higher
- React 19.x or higher
- Node.js 18.x or higher

### Step 1: Update Dependencies

```bash
npm install next@latest react@latest react-dom@latest next-runtime-env@latest
# or
pnpm update next react react-dom next-runtime-env
```

### Step 2: No Code Changes Required! 🎉

For most users, **no code changes are necessary**. The components (`PublicEnvScript`, `PublicEnvProvider`) and utility functions (`env()`) maintain the same public API.

### Step 3: Update Custom Dynamic Rendering (If Applicable)

If you were using `unstable_noStore()` in **custom implementations** (not the library's built-in components), update to Next.js 15 stable APIs:

**Before (Next.js 14):**
```tsx
import { unstable_noStore as noStore } from 'next/cache';

export default function CustomLayout({ children }) {
  noStore(); // Opt into dynamic rendering

  const customEnv = getCustomEnv();
  return <div>{children}</div>;
}
```

**After (Next.js 15+):**
```tsx
import { connection } from 'next/server';

export default async function CustomLayout({ children }) {
  // Opt into dynamic rendering (Next.js 15+)
  await connection();

  const customEnv = getCustomEnv();
  return <div>{children}</div>;
}
```

**Alternative approach using `headers()`:**
```tsx
import { headers } from 'next/headers';

export function getCustomEnv() {
  // Force dynamic rendering by accessing headers
  headers();

  return process.env.CUSTOM_VAR;
}
```

### What Changed Under the Hood

The library now uses Next.js 15's stable dynamic rendering APIs:

- `PublicEnvScript` and `PublicEnvProvider` use `await connection()`
- The `env()` utility uses `headers()` to force dynamic rendering
- All components are now async server components (React handles this automatically)

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
};
```

## Upgrading from v2.x to Current

If you're upgrading from Next.js 13 (v2.x):

1. Follow the steps above to update to Next.js 15
2. Review the [Next.js 15 upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading) for breaking changes
3. Test your application thoroughly

## Upgrading from v1.x (Pages Router)

If you're still using the Pages Router:

1. Consider migrating to the App Router first (see [Next.js migration guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration))
2. Use `next-runtime-env@1.x` for Pages Router support
3. Or upgrade to v3.x when you migrate to the App Router

## Version Compatibility Matrix

| next-runtime-env | Next.js | React | Notes |
|-----------------|---------|-------|-------|
| 3.x | 14.x - 15.x | 18.x - 19.x | App Router with async components |
| 2.x | 13.x | 18.x | App Router |
| 1.x | 12.x - 13.x | 17.x - 18.x | Pages Router only |

## Need Help?

- Check the [examples](../examples/) for working implementations
- Review the [documentation](../README.md)
- [Open an issue](https://github.com/hyperb1iss/next-runtime-env/issues) on GitHub
