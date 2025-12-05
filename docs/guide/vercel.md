# Vercel Deployment

Deploy to Vercel with runtime environment variables.

## How It Works on Vercel

Vercel has its own environment variable system. With next-dynenv:

1. Set variables in Vercel's dashboard
2. next-dynenv reads them at runtime
3. Changes take effect without redeploying

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

On Vercel, `NEXT_PUBLIC_*` variables set in the dashboard are available at:

- **Build time**: When Vercel builds your app
- **Runtime**: When next-dynenv reads them

next-dynenv ensures runtime values are used, not build-time cached values.

### Static Pages

If you're using static generation, environment variables are baked in at build time. Use dynamic rendering to get
runtime values:

```tsx
// This forces dynamic rendering
import { PublicEnvScript } from 'next-dynenv'

export const dynamic = 'force-dynamic'

export default function Page() {
    return (
        <html>
            <head>
                <PublicEnvScript />
            </head>
            <body>...</body>
        </html>
    )
}
```

Or simply use `PublicEnvScript` which automatically opts into dynamic rendering via `connection()`.

### ISR Considerations

For Incremental Static Regeneration, environment values are captured at revalidation time:

```tsx
export const revalidate = 60 // Revalidate every 60 seconds

export default function Page() {
    // Environment values updated on revalidation
    return <div>...</div>
}
```

## Deployment Checklist

- [ ] Add `PublicEnvScript` to your root layout
- [ ] Set environment variables in Vercel dashboard
- [ ] Configure variables for each environment (Production, Preview, Development)
- [ ] Verify runtime values in your deployed app
- [ ] Test preview deployments with preview-specific variables

## Next Steps

- [Other Platforms](/guide/other-platforms) - Railway, Fly.io, and more
- [Security](/guide/security) - Security best practices
- [API Reference](/api/) - Full API documentation
