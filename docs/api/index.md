# API reference

Every export comes from the package root. Use `import` everywhere, including `instrumentation.ts` and `next.config.ts`.

```ts
import { env, envParsers, PublicEnvScript } from 'next-dynenv'
```

## Exports

| Export                                                   | Kind                   | Runs on                                  | What it does                                                |
| -------------------------------------------------------- | ---------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| [`env()`](/api/env)                                      | Function               | Server and browser                       | Reads a variable, with an optional default                  |
| [`requireEnv()`](/api/require-env)                       | Function               | Server and browser                       | Reads a variable or throws when it is undefined             |
| [`serverOnly()`](/api/server-only)                       | Function               | Server (returns the fallback in browser) | Reads a secret from a module that also loads in the browser |
| [`envParsers`](/api/parsers)                             | Object of functions    | Server and browser                       | Parses booleans, numbers, arrays, JSON, URLs, and enums     |
| [`makeEnvPublic()`](/api/make-env-public)                | Function               | Server startup                           | Copies `KEY` to `NEXT_PUBLIC_KEY` in `process.env`          |
| [`PublicEnvScript`](/api/components#publicenvscript)     | Async server component | Server                                   | Writes every `NEXT_PUBLIC_*` variable to `window.__ENV`     |
| [`EnvScript`](/api/components#envscript)                 | Async server component | Server                                   | Writes an object you choose to `window.__ENV`               |
| [`PublicEnvProvider`](/api/components#publicenvprovider) | Async server component | Server                                   | Provides every `NEXT_PUBLIC_*` variable through Context     |
| [`EnvProvider`](/api/components#envprovider)             | Client component       | Server render and browser                | Provides an object you choose through Context               |
| [`useEnvContext()`](/api/components#useenvcontext)       | Client hook            | Client components                        | Reads the nearest provider's values                         |
| `PUBLIC_ENV_KEY`                                         | Constant               | Anywhere                                 | The `window` property name, `'__ENV'`                       |

The package exports no TypeScript types. When you need one, derive it:

```ts
import type { ComponentProps } from 'react'
import type { makeEnvPublic, PublicEnvScript } from 'next-dynenv'

type PublicEnvScriptProps = ComponentProps<typeof PublicEnvScript>
type MakeEnvPublicOptions = NonNullable<Parameters<typeof makeEnvPublic>[1]>
```

## Returns and throws

| Call                               | Returns                                  | Throws when                                                        |
| ---------------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `env(key)`                         | `string \| undefined`                    | In the browser with `window.__ENV` set, `key` lacks `NEXT_PUBLIC_` |
| `env(key, fallback)`               | `string`                                 | Same browser prefix rule                                           |
| `requireEnv(key)`                  | `string`                                 | The value is `undefined`, or the browser prefix rule               |
| `serverOnly(key)`                  | `string \| undefined`                    | Never                                                              |
| `serverOnly(key, fallback)`        | `string`                                 | Never                                                              |
| `envParsers.boolean(key)`          | `boolean`                                | Only the browser prefix rule                                       |
| `envParsers.number(key)`           | `number`                                 | The value is set but not a finite number                           |
| `envParsers.array(key)`            | `string[]`                               | Only the browser prefix rule                                       |
| `envParsers.json<T>(key)`          | `T`                                      | Missing with no default, or invalid JSON                           |
| `envParsers.url(key)`              | `string`                                 | Missing with no default, or not parseable by `new URL()`           |
| `envParsers.enum<T>(key, allowed)` | `T`                                      | Missing with no default, or not in the allowed list                |
| `makeEnvPublic(keys)`              | `void`                                   | Never, it logs warnings instead                                    |
| `useEnvContext()`                  | `{ [key: string]: string \| undefined }` | Called outside `PublicEnvProvider` or `EnvProvider`                |

Every parser reads through `env()`, so each one inherits the browser prefix rule.

## Which one do I want

- **A public value in any component:** `env()`, with [`PublicEnvScript`](/api/components#publicenvscript) in the root
  layout.
- **A value the app cannot run without:** [`requireEnv()`](/api/require-env).
- **A flag, port, list, URL, or config object:** [`envParsers`](/api/parsers).
- **A secret read by a module that also loads in the browser:** [`serverOnly()`](/api/server-only).
- **Only some public variables in the browser:** [`EnvScript`](/api/components#envscript).
- **Values through React Context instead of a global:** [`PublicEnvProvider`](/api/components#publicenvprovider) and
  [`useEnvContext()`](/api/components#useenvcontext).
- **Deployment config that uses unprefixed names:** [`makeEnvPublic()`](/api/make-env-public) in `instrumentation.ts`.

## How the pieces connect

On the server, `env()` reads `process.env` directly. For the browser, `PublicEnvScript` reads every `NEXT_PUBLIC_*`
variable at request time and writes them to a frozen `window.__ENV`, which `env()` and `envParsers` read after that. The
context approach skips the global: `PublicEnvProvider` hands the same values to client components through
`useEnvContext()`. [How it works](/guide/how-it-works) walks through the request lifecycle.
