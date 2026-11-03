# next-dynenv example: context approach

A Next.js App Router app that wraps the page content in `<PublicEnvProvider>` and reads runtime values in client
components with `useEnvContext()`. No script tag, no `window.__ENV`.

Walkthrough: https://hyperb1iss.github.io/next-dynenv/examples/app-router-context.html

## Run it

This example is a pnpm workspace member and uses the local build of `next-dynenv`. From the repository root:

```bash
pnpm install
pnpm build
cp examples/with-app-router-context/.env.example examples/with-app-router-context/.env.local
pnpm --filter example-app-router-context dev
```

Open http://localhost:3000.

## Build once, run with new values

```bash
pnpm --filter example-app-router-context build
NEXT_PUBLIC_FOO=first BAR=secret BAZ=shared pnpm --filter example-app-router-context start
```

Stop the server, start the same build with different values, and the pages show them without a rebuild.

## Routes

| Route          | Shows                                                          |
| -------------- | -------------------------------------------------------------- |
| `/client-side` | `NEXT_PUBLIC_FOO` and `NEXT_PUBLIC_BAZ` from `useEnvContext()` |
| `/server-side` | `BAR` and `BAZ` read with `env()` in a server component        |
| `/api/bar-baz` | `BAR` and `BAZ` as JSON from a route handler                   |

## Files

- `src/app/layout.tsx`: `<PublicEnvProvider>` around the page content
- `src/instrumentation.ts`: `makeEnvPublic('BAZ')`, so `BAZ` also reaches the browser as `NEXT_PUBLIC_BAZ`
- `src/app/client-side/page.tsx`, `src/app/server-side/page.tsx`, `src/app/api/bar-baz/route.ts`: the demo routes

In client components, read values with `useEnvContext()`. `env()` and `envParsers` look for `window.__ENV`, which this
app never creates, so in the browser they return `undefined` or your default.

## Use it outside this repo

Copy the folder, then replace `workspace:*` and the `catalog:` entries in `package.json` with real versions
(`npm install next-dynenv next react react-dom`).

## Learn more

- Context approach: https://hyperb1iss.github.io/next-dynenv/guide/context-approach.html
- Components API: https://hyperb1iss.github.io/next-dynenv/api/components.html
- Script approach example: ../with-app-router-script
