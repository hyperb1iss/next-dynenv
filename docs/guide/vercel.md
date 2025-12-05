# Vercel Deployment

Deploy to Vercel with true runtime environment variables—change configs without rebuilding.

## How It Works on Vercel

Vercel has built-in environment variable management. With next-dynenv:

1. **Set variables** in Vercel's dashboard
2. **next-dynenv reads them** at runtime (not build time)
3. **Changes take effect immediately** without redeploying

::: info Key Benefit Traditional Next.js on Vercel bakes `NEXT_PUBLIC_*` variables into the build. next-dynenv reads
them at runtime, so you can change variables without triggering a rebuild. :::

## Basic Setup

### 1. Add PublicEnvScript

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

### 2. Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add your `NEXT_PUBLIC_*` variables
4. Select which environments they apply to (Production, Preview, Development)

### 3. Deploy

```bash
vercel deploy
```

## Environment-Specific Variables

Vercel allows different values per environment:

| Variable              | Production             | Preview                   | Development             |
| --------------------- | ---------------------- | ------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | `https://api.prod.com` | `https://api.staging.com` | `http://localhost:8080` |
| `NEXT_PUBLIC_DEBUG`   | `false`                | `true`                    | `true`                  |

## Using vercel.json

You can also define environment variables in `vercel.json`:

```json
{
    "env": {
        "NEXT_PUBLIC_APP_NAME": "MyApp"
    },
    "build": {
        "env": {
            "NEXT_PUBLIC_BUILD_TIME": "@build-time"
        }
    }
}
```

::: tip For sensitive values, always use the Vercel dashboard instead of `vercel.json`. :::

## Preview Deployments

Each pull request gets its own preview deployment. Set preview-specific variables:

```
NEXT_PUBLIC_API_URL (Preview) = https://api-preview.example.com
```

## Edge Functions

next-dynenv works with Vercel Edge Functions:

```ts
// middleware.ts
import { env } from 'next-dynenv'
import { NextResponse } from 'next/server'

export function middleware(request) {
    const maintenanceMode = env('NEXT_PUBLIC_MAINTENANCE', 'false')

    if (maintenanceMode === 'true') {
        return NextResponse.redirect(new URL('/maintenance', request.url))
    }

    return NextResponse.next()
}
```

## Serverless Functions

```ts
// app/api/config/route.ts
import { env } from 'next-dynenv'

export function GET() {
    return Response.json({
        apiUrl: env('NEXT_PUBLIC_API_URL'),
        environment: env('NEXT_PUBLIC_ENV', 'production'),
    })
}
```

## Vercel CLI

Set environment variables via CLI:

```bash
# Add a variable
vercel env add NEXT_PUBLIC_API_URL

# List variables
vercel env ls

# Pull variables to local .env
vercel env pull .env.local
```

## Important Considerations

### Runtime vs Build Time

On Vercel, `NEXT_PUBLIC_*` variables set in the dashboard are available at both build time and runtime. next-dynenv
ensures you get the **runtime** values, not stale build-time values.

### Static Pages and ISR

If you're using static generation (SSG) or ISR, environment variables are captured at generation time:

```tsx
// Pages with ISR revalidate periodically
export const revalidate = 60 // Env vars update every 60 seconds

export default function Page() {
    return <div>...</div>
}
```

For truly dynamic pages, `PublicEnvScript` automatically opts into dynamic rendering via `connection()`:

```tsx
import { PublicEnvScript } from 'next-dynenv'

export default function Page() {
    return (
        <html>
            <head>
                <PublicEnvScript /> {/* Automatically dynamic */}
            </head>
            <body>...</body>
        </html>
    )
}
```

## Deployment Checklist

Before deploying to Vercel, make sure you've:

- [ ] Added `PublicEnvScript` to your root layout
- [ ] Set all `NEXT_PUBLIC_*` variables in Vercel dashboard
- [ ] Configured environment-specific values (Production, Preview, Development)
- [ ] Tested preview deployments with preview-specific variables
- [ ] Verified runtime values in deployed app (check browser console for `window.__ENV`)

## Next Steps

- [Other Platforms](/guide/other-platforms) - Railway, Fly.io, and more
- [Security](/guide/security) - Security best practices
- [API Reference](/api/) - Full API documentation
