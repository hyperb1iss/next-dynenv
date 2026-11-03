# next-dynenv example: script approach

A Next.js App Router app that renders `<PublicEnvScript />` in the root layout and reads runtime values with `env()`. It
also runs a strict Content Security Policy with a per-request nonce.

Walkthrough: https://hyperb1iss.github.io/next-dynenv/examples/app-router-script.html

## Run it

This example is a pnpm workspace member and uses the local build of `next-dynenv`. From the repository root:

```bash
pnpm install
pnpm build
cp examples/with-app-router-script/.env.example examples/with-app-router-script/.env.local
pnpm --filter example-app-router-script dev
```

Open http://localhost:3000.

## Build once, run with new values

```bash
pnpm --filter example-app-router-script build
NEXT_PUBLIC_FOO=first BAR=secret BAZ=shared pnpm --filter example-app-router-script start
```

Stop the server, start the same build with different values, and the pages show them without a rebuild.

## Routes

| Route          | Shows                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| `/client-side` | `NEXT_PUBLIC_FOO` and `NEXT_PUBLIC_BAZ` read with `env()` in the browser |
| `/server-side` | `BAR` and `BAZ` read with `env()` in a server component                  |
| `/api/bar-baz` | `BAR` and `BAZ` as JSON from a route handler                             |

## Files

- `src/app/layout.tsx`: `<PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />` in `<head>`
- `src/proxy.ts`: per-request nonce, CSP response header, and the `x-nonce` request header
- `src/instrumentation.ts`: `makeEnvPublic('BAZ')`, so `BAZ` also reaches the browser as `NEXT_PUBLIC_BAZ`
- `src/app/client-side/page.tsx`, `src/app/server-side/page.tsx`, `src/app/api/bar-baz/route.ts`: the demo routes

## Use it outside this repo

Copy the folder, then replace `workspace:*` and the `catalog:` entries in `package.json` with real versions
(`npm install next-dynenv next react react-dom`).

## Learn more

- Script approach: https://hyperb1iss.github.io/next-dynenv/guide/script-approach.html
- Making env public: https://hyperb1iss.github.io/next-dynenv/guide/making-env-public.html
- Security and CSP: https://hyperb1iss.github.io/next-dynenv/guide/security.html
