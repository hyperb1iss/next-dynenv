# Troubleshooting

Start every investigation in the browser console:

```js
window.__ENV
```

If the object is there and has your key, the server side worked and the problem is in how the client reads it. If it's
missing or empty, the problem is on the server.

## `env()` returns `undefined` in a client component

Work through these in order:

1. **Is the script rendered?** `PublicEnvScript` (or `EnvScript`) must be in the root layout's `<head>`. With only
   `PublicEnvProvider`, there is no `window.__ENV`; read values with `useEnvContext()` instead.
2. **Is the variable set where the server runs?** The process that runs `next start` or `node server.js` needs it, not
   the machine that ran `next build`. Check `window.__ENV`.
3. **Does it have the prefix?** Only `NEXT_PUBLIC_*` variables are sent. Use
   [`makeEnvPublic()`](/guide/making-env-public) for variables your platform names without it.
4. **Does the code run before hydration?** `instrumentation-client.ts` and early third-party snippets run before the
   default script. Switch to `<PublicEnvScript disableNextScript />`.
5. **Did you change the script strategy?** `nextScriptProps` without `strategy: 'beforeInteractive'`, or with
   `afterInteractive`, runs the script too late.

## The browser shows the build-time value

- **A literal `process.env.NEXT_PUBLIC_X` in client code.** Next.js replaces those at build time. Switch to
  `env('NEXT_PUBLIC_X')`.
- **The route was prerendered.** `EnvScript` and `EnvProvider` don't opt into dynamic rendering. Call
  `await connection()` before reading `process.env`, as shown in [custom variables](/guide/custom-variables).
- **The server hasn't restarted.** Environment variables are read when the process starts. Restart the container or roll
  the deployment. On Vercel, changes apply to [new deployments only](/guide/vercel).

## Hydration mismatch after adding next-dynenv

The server rendered one value and the browser another. Usual causes:

- `strategy: 'afterInteractive'` in `nextScriptProps`: client components hydrate before `window.__ENV` exists.
- An `EnvScript` object that renames keys, such as `NEXT_PUBLIC_API_URL: process.env.API_URL`. The server reads
  `process.env.NEXT_PUBLIC_API_URL`, the browser reads the renamed key. Use `makeEnvPublic()` in `register()` instead.
- `serverOnly()` rendered in a client component. It returns the real value on the server and the fallback in the
  browser.

## `Environment variable 'X' is not public and cannot be accessed in the browser`

Browser code asked for a key without the `NEXT_PUBLIC_` prefix. If the value is safe to publish, expose it with
[`makeEnvPublic()`](/guide/making-env-public) or rename it. If it's a secret, move the read to a server component, route
handler, or server action. Don't paper over this one: on the server, that same call already rendered the secret into the
HTML. See [Security](/guide/security#client-components-render-on-the-server-too).

## `useEnvContext must be used within a EnvProvider or PublicEnvProvider`

The component isn't inside a provider. Check that `PublicEnvProvider` wraps `children` in a layout above the component,
and that the hook isn't called in the same layout that renders the provider.

## `makeEnvPublic()` copies are missing

- **It's in `next.config` and you use `output: 'standalone'`.** Standalone servers never evaluate `next.config` at
  runtime. Move the call to `register()` in `instrumentation.ts`.
- **The source variable is unset.** Look for `Skipped prefixing environment variable` in the server logs.
- **`instrumentation.ts` is in the wrong place.** With a `src/` directory it belongs at `src/instrumentation.ts`.

## The script is blocked by Content Security Policy

The console shows a CSP violation for an inline script. Pass the request nonce through the `nonce` prop, for example
`{ headerKey: 'x-nonce' }`, and generate that header in proxy. With `disableNextScript`, the nonce prop is required.
[Script approach](/guide/script-approach#content-security-policy) has the full setup.

## Build fails with `connection()` accessed outside of `<Suspense>`

You have `cacheComponents` enabled. Wrap the part of the root layout that renders `PublicEnvScript` or
`PublicEnvProvider` in `<Suspense>`. See [dynamic rendering](/guide/how-it-works#dynamic-rendering).

## My pages are no longer static

That's expected. Runtime values need runtime rendering, so routes under `PublicEnvScript` or `PublicEnvProvider` render
per request. Keep static sections under a separate root layout if they don't need runtime config.

## TypeScript wants a `string`, gets `string | undefined`

Pick the call that matches your intent:

```ts
const optional = env('NEXT_PUBLIC_API_URL') // string | undefined
const withDefault = env('NEXT_PUBLIC_API_URL', 'http://localhost:8080') // string
const required = requireEnv('NEXT_PUBLIC_API_URL') // string, throws if unset
```

## Still stuck?

Issues are disabled on the repository. If you've found a bug, a
[pull request](https://github.com/hyperb1iss/next-dynenv/pulls) with a failing test or a fix is the fastest path.
