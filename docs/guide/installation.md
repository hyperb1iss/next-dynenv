# Installation

Get next-dynenv installed and verified in under a minute.

## Requirements

- **Next.js** 15.x or 16.x
- **React** 19.x
- **Node.js** 20.x or higher

::: info Compatibility Note next-dynenv requires Next.js 15+ because it leverages the `connection()` API for dynamic
rendering. If you're on Next.js 14 or earlier, you'll need to upgrade first. :::

## Package Installation

::: code-group

```bash [npm]
npm install next-dynenv
```

```bash [pnpm]
pnpm add next-dynenv
```

```bash [yarn]
yarn add next-dynenv
```

```bash [bun]
bun add next-dynenv
```

:::

## TypeScript Support

next-dynenv is written in TypeScript with built-in type definitions. No additional `@types` packages needed—you get full
type safety out of the box.

## Peer Dependencies

The package requires `next` and `react` as peer dependencies:

```json
{
    "peerDependencies": {
        "next": "^15 || ^16",
        "react": "^19"
    }
}
```

Your package manager will handle these automatically if they're already installed.

## Verify Installation

Quick sanity check:

```tsx
import { env } from 'next-dynenv'

// Should import without errors
console.log(typeof env) // 'function'
```

If you see `'function'`, you're good to go.

## Next Steps

Head to [Quick Start](/guide/quick-start) to set up your first runtime environment variable.
