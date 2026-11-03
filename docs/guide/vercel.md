# Vercel

next-dynenv runs on Vercel with no extra setup: add the script, set your variables in the project, deploy. The code is
the same code you would ship to Docker or any `next start` host.

## Set it up

1. Render `PublicEnvScript` in the root layout:

    ```tsx
    // app/layout.tsx
    import { PublicEnvScript } from 'next-dynenv'

    export default function RootLayout({ children }: { children: React.ReactNode }) {
        return (
            <html lang="en">
                <head>
                    <PublicEnvScript />
                </head>
                <body>{children}</body>
            </html>
        )
    }
    ```

2. Add variables under **Project Settings → Environment Variables**, scoped to Production, Preview, or Development.

3. Deploy with `git push` or `vercel deploy`.

## Changing a value means a new deployment

::: warning Variables are tied to deployments

Vercel applies environment variable changes to new deployments only. After you edit a value, redeploy from the dashboard
or run `vercel redeploy <deployment-url>`. Existing deployments keep the values they started with.

:::

So on Vercel, next-dynenv does not let you skip the deploy. What it does give you:

- One code path for every host. The same `env()` calls work on Vercel, in Docker, and on a plain Node server.
- Per-environment values with no code changes. Production and Preview each read their own variables at request time.
- The same guardrails everywhere: only `NEXT_PUBLIC_*` values reach the browser, escaped and frozen.

The biggest payoff is on hosts where you control the runtime and can restart the same build with new values. See
[Docker](/guide/docker) and [other platforms](/guide/other-platforms).

## Per-environment values

| Variable              | Production                | Preview                       | Development             |
| --------------------- | ------------------------- | ----------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | `https://api.example.com` | `https://staging.example.com` | `http://localhost:8080` |
| `NEXT_PUBLIC_DEBUG`   | `false`                   | `true`                        | `true`                  |

## Vercel CLI

```bash
# Add a variable to one environment
vercel env add NEXT_PUBLIC_API_URL production

# List variables
vercel env ls

# Pull Development values into a local file for next dev
vercel env pull .env.local
```

## Rendering

`PublicEnvScript` and `PublicEnvProvider` call `connection()`, so every route under that layout renders per request in a
Vercel Function. Static generation and ISR do not apply to those routes. To keep some routes static, give them their own
root layout in a [route group](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) without the
script; client code on those routes then has no `window.__ENV` to read.

## Checklist

- `PublicEnvScript` (or `PublicEnvProvider`) is in the root layout
- Public values use the `NEXT_PUBLIC_` prefix, or are copied with [`makeEnvPublic()`](/api/make-env-public) in
  `instrumentation.ts`
- Production and Preview each have their own values
- You redeployed after the last variable change
- In the deployed app, `window.__ENV` in the browser console shows the values you expect

## Next steps

- [Other platforms](/guide/other-platforms): hosts where a restart is enough
- [Security](/guide/security): what is safe to send to the browser
- [API reference](/api/)
