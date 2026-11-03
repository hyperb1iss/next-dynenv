# How it works

One request, start to finish.

## The request path

```text
server   ─▶ <PublicEnvScript /> in the root layout
             ├─ await connection()     render this route per request
             ├─ read process.env       keep keys starting with NEXT_PUBLIC_
             └─ render inline script   window.__ENV = escaped, frozen JSON

browser  ─▶ script runs before hydration
             └─ env('NEXT_PUBLIC_API_URL') reads window.__ENV
```

On the server, `env()` never touches `window.__ENV`. It reads `process.env` directly, so server components, route
handlers, and proxy see every variable, public or not.

## What lands in the HTML

For `NEXT_PUBLIC_API_URL=https://api.example.com`, the script sets:

```js
window['__ENV'] = Object.freeze({ NEXT_PUBLIC_API_URL: 'https://api.example.com' })
```

Two details matter:

- **Escaping.** The JSON is escaped so `<`, `>`, `&`, and `'` become `\u003c`, `\u003e`, `\u0026`, and `\u0027`. A value
  like `</script><script>alert(1)</script>` stays a string and can't close the tag.
- **Freezing.** `Object.freeze` makes the object read-only. Assigning to `window.__ENV.NEXT_PUBLIC_API_URL` throws in
  strict mode code (every ES module) and is ignored elsewhere.

## When the script runs

By default the script goes through `next/script` with `strategy: 'beforeInteractive'`. Next.js queues it and runs it
before React hydrates, so client components always find `window.__ENV` populated.

Code that runs before hydration is the exception. `instrumentation-client.ts` (where SDKs like Sentry initialize) runs
before Next.js processes `beforeInteractive` scripts, so `env()` there returns `undefined`. Render a plain inline script
instead, which runs while the browser parses `<head>`:

```tsx
<PublicEnvScript disableNextScript nonce={{ headerKey: 'x-nonce' }} />
```

With `disableNextScript`, Next.js no longer adds its CSP nonce for you, so pass `nonce` yourself if you use a Content
Security Policy. [Script approach](/guide/script-approach#loading-order) has the full story.

::: warning Keep the default strategy

Don't pass `strategy: 'afterInteractive'` in `nextScriptProps`. Client components hydrate before an `afterInteractive`
script runs, so `env()` returns `undefined` during hydration and React reports a mismatch with the server HTML.

:::

## Dynamic rendering

Next.js prerenders pages at build time whenever it can. A prerendered page would capture the build machine's
environment, which is exactly what next-dynenv exists to avoid.

`PublicEnvScript` and `PublicEnvProvider` call
[`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection) before reading `process.env`. That
tells Next.js the output depends on the incoming request, so every route under that layout renders per request.

The cost is real: routes under the layout lose static HTML and ISR. If parts of your site must stay static, give them
their own root layout in a [route group](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
without the script, and don't call `env()` in their client components.

`EnvScript` and `EnvProvider` don't call `connection()`, because they render whatever object you pass them. If you build
that object from `process.env`, call `await connection()` yourself. [Custom variables](/guide/custom-variables) shows
the pattern.

::: info With `cacheComponents`

When [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) is on, Next.js
rejects `connection()` outside a `<Suspense>` boundary during prerendering. Wrap the part of the root layout that
renders `PublicEnvScript` or `PublicEnvProvider` in `<Suspense>`, and have server components that read `env()` call
`await connection()` themselves so their values aren't cached at build time. The integration suite covers the default
rendering model.

:::

## How `env()` decides

| Situation                                              | Reads          | Non-public key      |
| ------------------------------------------------------ | -------------- | ------------------- |
| Server: server components, route handlers, proxy, SSR  | `process.env`  | Returned            |
| Browser, after `PublicEnvScript` or `EnvScript` ran    | `window.__ENV` | Throws              |
| Browser, no script on the page (context approach only) | Nothing useful | Returns `undefined` |

The last row matters if you use the [context approach](/guide/context-approach): `env()` and `envParsers` don't read
React Context. Client components there use `useEnvContext()`.

## Script or context

Both approaches deliver the same values from the same source. They differ in how client code reads them.

|                             | Script approach                   | Context approach                      |
| --------------------------- | --------------------------------- | ------------------------------------- |
| Server component            | `<PublicEnvScript />` in `<head>` | `<PublicEnvProvider>` around children |
| Client read                 | `env('NEXT_PUBLIC_X')`            | `useEnvContext().NEXT_PUBLIC_X`       |
| Works outside React         | Yes, any browser code             | No, hooks only                        |
| `envParsers` in the browser | Yes                               | No                                    |
| Before hydration            | With `disableNextScript`          | No                                    |
| Values visible in page HTML | Yes, inline script                | Yes, React Server Component payload   |

Pick the [script approach](/guide/script-approach) unless you specifically want values to flow through React. Read
[context approach](/guide/context-approach) for when that's true.
