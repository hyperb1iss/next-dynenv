# serverOnly()

Read a server secret from a module that also loads in the browser. Returns the real value on the server and the fallback
in the browser. Never throws.

## Import

```ts
import { serverOnly } from 'next-dynenv'
```

## Signature

```ts
function serverOnly(key: string): string | undefined
function serverOnly<T extends string>(key: string, fallback: T): string
```

## Parameters

| Parameter  | Type     | Description                                                                         |
| ---------- | -------- | ----------------------------------------------------------------------------------- |
| `key`      | `string` | Variable name. No prefix rule: secrets are the point.                               |
| `fallback` | `string` | Optional. Returned in the browser, and on the server when the value is `undefined`. |

## Returns

| Runs in | Variable set | Result                                       |
| ------- | ------------ | -------------------------------------------- |
| Server  | Yes          | The value                                    |
| Server  | No           | `fallback`, or `undefined`                   |
| Browser | Either       | `fallback`, or `undefined`. Nothing is read. |

"Browser" means `typeof window !== 'undefined'` when the module loads. Unlike [`env()`](/api/env), `serverOnly()` does
not depend on `PublicEnvScript`, and it never throws for unprefixed keys. Only the variable name ships in client
bundles, never its value.

## When to use it

Reach for `serverOnly()` when one config module feeds both server and client code, and some fields only make sense on
the server. Without it, the browser hits the `env()` prefix error the first time that module runs.

::: danger Never render it from a client component

Client components also render on the server during SSR. There `serverOnly()` returns the real value, so a client
component that renders it writes the secret into the HTML before the browser ever sees the fallback (React then reports
a hydration mismatch, but the secret has already shipped). Use `serverOnly()` for config and getter code, and read
secrets for display only in server components and route handlers.

:::

## Examples

### Shared config

```ts
// lib/config.ts
import { env, serverOnly } from 'next-dynenv'
import { z } from 'zod'

const ConfigSchema = z.object({
    apiUrl: z.url(),
    databaseUrl: z.string().optional(),
})

// A function, not a module-level constant, so values are read when it's called
export function getConfig() {
    return ConfigSchema.parse({
        apiUrl: env('NEXT_PUBLIC_API_URL'),
        // The real value on the server, undefined in the browser
        databaseUrl: serverOnly('DATABASE_URL'),
    })
}
```

### Internal and public endpoints

```ts
// lib/api-base.ts
import { env, serverOnly } from 'next-dynenv'

export function apiBase() {
    // Server: the private cluster address. Browser: the public URL.
    return serverOnly('INTERNAL_API_URL') ?? env('NEXT_PUBLIC_API_URL', 'https://api.example.com')
}
```

### Typed fallback

```ts
import { serverOnly } from 'next-dynenv'

// Typed string: the region on the server, 'unknown' in the browser or when unset
const region = serverOnly('DEPLOY_REGION', 'unknown')
```

::: tip Keep a module out of the browser entirely

When a module should never reach client bundles, add `import 'server-only'` at its top. The build then fails on any
client import, which is stricter than a runtime fallback.

:::

## Related

- [`env()`](/api/env) for public values and server-side reads
- [Security](/guide/security) for what reaches the browser
- [Context approach](/guide/context-approach) and [script approach](/guide/script-approach) for client access
