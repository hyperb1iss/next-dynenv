# Pages Router

There is no app in this folder on purpose. `next-dynenv` 4.x targets the Next.js App Router (Next.js 15 and 16,
React 19) and does not support the Pages Router.

The browser half of the library is `PublicEnvScript` and `PublicEnvProvider`, both async server components that only the
App Router can render. Without them there is no `window.__ENV`, so `env()` has nothing to read in Pages Router client
code.

## What still works in Pages Router code

`env()`, `requireEnv()`, `serverOnly()`, and `envParsers` read `process.env` on the server. They work in
`getServerSideProps` and in `pages/api` handlers, the same as reading `process.env` directly.

## Options

**Move routes to the App Router incrementally.** `app/` and `pages/` can live in one project. Routes under `app/` get
full `next-dynenv` support while the rest keep working. See the Next.js
[App Router migration guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration).

**Stay on an older Next.js.** The original [next-runtime-env](https://github.com/expatfile/next-runtime-env) 1.x
supports the Pages Router on Next.js 12 and 13. It is no longer maintained.

## Learn more

- Documentation: https://hyperb1iss.github.io/next-dynenv/
- App Router examples: [script approach](../with-app-router-script), [context approach](../with-app-router-context)
- Contributions are welcome as pull requests: https://github.com/hyperb1iss/next-dynenv/pulls
