# Installation

## Requirements

| Requirement | Version                                      |
| ----------- | -------------------------------------------- |
| Next.js     | 15 or 16, App Router                         |
| React       | 19                                           |
| Node.js     | 20.9 or newer (the same floor as Next.js 16) |

`next` and `react` are peer dependencies, so next-dynenv uses the versions your app already has.

## Install

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

Types ship with the package. There is nothing else to install or configure.

## Module format

next-dynenv is an ES module. Import it with `import` syntax everywhere, including config files:

```ts
// next.config.ts, instrumentation.ts, app code
import { env, makeEnvPublic, PublicEnvScript } from 'next-dynenv'
```

## Pages Router

Version 4 targets the App Router. `PublicEnvScript` and `PublicEnvProvider` are async server components, which the Pages
Router can't render. The server-side helpers (`env()`, `requireEnv()`, `serverOnly()`, `envParsers`) only read
`process.env`, so they work in Pages Router server code, but nothing delivers values to the browser there.

The `app/` and `pages/` directories can live side by side, so you can adopt next-dynenv route by route as you migrate.
See the [Pages Router note](https://github.com/hyperb1iss/next-dynenv/tree/main/examples/with-pages-router) in the
repository for options.

## Version guide

| Package              | Next.js                  | Status       |
| -------------------- | ------------------------ | ------------ |
| `next-dynenv@4`      | 15 and 16 (App Router)   | Maintained   |
| `next-runtime-env@3` | 14                       | Unmaintained |
| `next-runtime-env@2` | 13 (App Router)          | Unmaintained |
| `next-runtime-env@1` | 12 and 13 (Pages Router) | Unmaintained |

next-dynenv is a fork of [next-runtime-env](https://github.com/expatfile/next-runtime-env). Moving from
`next-runtime-env@3` means upgrading to Next.js 15 or newer and changing the import path; the core API (`env()`,
`PublicEnvScript`, `PublicEnvProvider`, `useEnvContext()`, `makeEnvPublic()`) keeps its shape.

## Next steps

Head to the [quick start](/guide/quick-start).
