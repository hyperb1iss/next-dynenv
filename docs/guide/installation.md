# Installation

## Requirements

- **Next.js** 15.x or 16.x
- **React** 19.x
- **Node.js** 20.x or higher

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

:::

## TypeScript Support

next-dynenv is written in TypeScript and includes built-in type definitions. No additional `@types` packages are needed.

## Peer Dependencies

The package has peer dependencies on `next` and `react`:

```json
{
    "peerDependencies": {
        "next": "^15 || ^16",
        "react": "^19"
    }
}
```

## Verify Installation

After installation, verify it works:

```tsx
import { env } from 'next-dynenv'

// Should import without errors
console.log(typeof env) // 'function'
```

## Next Steps

Continue to [Quick Start](/guide/quick-start) to set up your first runtime environment variable.
