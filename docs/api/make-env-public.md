# makeEnvPublic()

Copy unprefixed variables such as `API_URL` to `NEXT_PUBLIC_API_URL` in `process.env`, so
[`PublicEnvScript`](/api/components#publicenvscript) and [`env()`](/api/env) can serve them to the browser without
renaming anything in your deployment config.

## Import

```ts
import { makeEnvPublic } from 'next-dynenv'
```

## Signature

```ts
function makeEnvPublic(key: string | string[], options?: { logLevel?: 'silent' | 'error' | 'warn' | 'info' }): void
```

## Parameters

| Parameter          | Type                                      | Description                                                        |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------ |
| `key`              | `string \| string[]`                      | One variable name or a list of names                               |
| `options.logLevel` | `'silent' \| 'error' \| 'warn' \| 'info'` | Optional. Hides log lines below this level. Unset logs everything. |

## Behavior

For each key:

| `process.env[key]` | Key                        | Result                                                                          | Log     |
| ------------------ | -------------------------- | ------------------------------------------------------------------------------- | ------- |
| `undefined`        | Any                        | Skipped                                                                         | Warning |
| Set                | Starts with `NEXT_PUBLIC_` | Skipped                                                                         | Warning |
| Set                | Anything else              | `process.env.NEXT_PUBLIC_<key>` gets the same value, replacing any existing one | Success |

The original variable stays in place. An empty string counts as set and gets copied. `makeEnvPublic()` never throws.

## Where to call it

Call it from `register()` in `instrumentation.ts` (or `src/instrumentation.ts` when your app uses a `src` directory).
Next.js runs `register()` once when each server instance starts, before it handles requests, in every output mode,
including `output: 'standalone'`.

```ts
// instrumentation.ts
import { makeEnvPublic } from 'next-dynenv'

export function register() {
    makeEnvPublic(['API_URL', 'APP_NAME'])
}
```

`PublicEnvScript` then includes `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_NAME`, and client components read them with
`env('NEXT_PUBLIC_API_URL')`.

::: warning next.config is not a substitute

A call at the top of `next.config.ts` works with `next start`, which evaluates the config when the server boots. It does
nothing at runtime with `output: 'standalone'`: the generated `server.js` embeds the serialized config and never runs
`next.config.ts` again. Keep the call in `instrumentation.ts`.

:::

Read the copies through `env()`, not `process.env.NEXT_PUBLIC_API_URL` in client code. Next.js inlines literal
`process.env.NEXT_PUBLIC_*` references into client bundles at build time, long before `register()` runs.

## Logging

Success lines go to `console.log` and warnings to `console.warn`, each tagged `(next-dynenv)`:

```text
 ✓ Prefixed environment variable 'API_URL' (next-dynenv)
 ⚠ Skipped prefixing environment variable 'REGION'. Variable not in process.env (next-dynenv)
 ⚠ Environment variable 'NEXT_PUBLIC_APP_NAME' is already public (next-dynenv)
```

| `logLevel` | Success lines | Warnings |
| ---------- | ------------- | -------- |
| Unset      | Shown         | Shown    |
| `'info'`   | Hidden        | Shown    |
| `'warn'`   | Hidden        | Shown    |
| `'error'`  | Hidden        | Hidden   |
| `'silent'` | Hidden        | Hidden   |

`'info'` already hides the success lines, which log one level below it. Leave `logLevel` unset to see them:

```ts
// instrumentation.ts
import { makeEnvPublic } from 'next-dynenv'

export function register() {
    makeEnvPublic(['API_URL', 'APP_NAME'], {
        // Every line in development, warnings only in production
        logLevel: process.env.NODE_ENV === 'production' ? 'warn' : undefined,
    })
}
```

## Security

Only copy values you would put on a public web page. `PublicEnvScript` writes every `NEXT_PUBLIC_*` variable into the
HTML of every route under its layout, so `makeEnvPublic(['DATABASE_URL'])` publishes your database URL.

## Related

- [Making env public](/guide/making-env-public) walks through migrating unprefixed config
- [`PublicEnvScript`](/api/components#publicenvscript) serves the copies to the browser
- [Docker](/guide/docker) covers standalone builds
