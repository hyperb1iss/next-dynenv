# Examples

Two small App Router apps live in the repository. They expose the same variables on the same routes and differ only in
how the browser receives public values.

| Example                                                     | Layout renders                    | Client components read   | Also shows                          |
| ----------------------------------------------------------- | --------------------------------- | ------------------------ | ----------------------------------- |
| [Script approach](/examples/app-router-script) (start here) | `<PublicEnvScript>` in `<head>`   | `env('NEXT_PUBLIC_FOO')` | Strict CSP with a per-request nonce |
| [Context approach](/examples/app-router-context)            | `<PublicEnvProvider>` in `<body>` | `useEnvContext()`        | React Context only, no script tag   |

Both apps share:

- `src/instrumentation.ts`, which calls `makeEnvPublic('BAZ')` so `BAZ` also reaches the browser as `NEXT_PUBLIC_BAZ`
- `/client-side`, a client component showing `NEXT_PUBLIC_FOO` and `NEXT_PUBLIC_BAZ`
- `/server-side`, a server component reading the server-only `BAR` and `BAZ` with `env()`
- `/api/bar-baz`, a route handler returning `BAR` and `BAZ` as JSON
- `.env.example` with `NEXT_PUBLIC_FOO`, `BAR`, and `BAZ` (published as `NEXT_PUBLIC_BAZ` by `instrumentation.ts`)

## Run them

The examples are pnpm workspace members that use the local build of `next-dynenv`. From the repository root:

```bash
git clone https://github.com/hyperb1iss/next-dynenv.git
cd next-dynenv
pnpm install
pnpm build

cp examples/with-app-router-script/.env.example examples/with-app-router-script/.env.local
pnpm --filter example-app-router-script dev
```

Swap in `with-app-router-context` and `example-app-router-context` for the context version. Open
`http://localhost:3000`.

## Build once, run with new values

This is the whole point, so try it with a production build:

```bash
pnpm --filter example-app-router-script build

NEXT_PUBLIC_FOO=first BAR=secret BAZ=shared pnpm --filter example-app-router-script start
# stop it, then start the same build with different values
NEXT_PUBLIC_FOO=second BAR=rotated BAZ=moved pnpm --filter example-app-router-script start
```

`/client-side` and `/server-side` show the new values after the restart, with no rebuild in between.

## Script or context?

|                                                 | Script                       | Context                                           |
| ----------------------------------------------- | ---------------------------- | ------------------------------------------------- |
| Client access                                   | `env()` and `envParsers`     | `useEnvContext()`                                 |
| Code outside React (Sentry init, plain modules) | Yes, via `env()`             | No                                                |
| `env()` and `envParsers` in the browser         | Yes                          | No, they return `undefined` or defaults           |
| Values in the HTML                              | Inline `window.__ENV` script | Serialized in the React Server Components payload |
| Extra markup in `<head>`                        | One script tag               | None                                              |

Code that runs before hydration, such as Sentry setup in `instrumentation-client.ts`, also needs `disableNextScript`;
the [script approach guide](/guide/script-approach) covers that timing.

The server side is identical: server components, route handlers, and `proxy.ts` read `process.env` through `env()` with
either approach. Start with the script approach unless you have a reason to keep everything inside React. The
[context approach guide](/guide/context-approach) covers the alternative in depth.

## Source

- [examples/with-app-router-script](https://github.com/hyperb1iss/next-dynenv/tree/main/examples/with-app-router-script)
- [examples/with-app-router-context](https://github.com/hyperb1iss/next-dynenv/tree/main/examples/with-app-router-context)
- [examples/with-pages-router](https://github.com/hyperb1iss/next-dynenv/tree/main/examples/with-pages-router): why
  there is no Pages Router app
