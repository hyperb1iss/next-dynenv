# Docker and Kubernetes

Build one image, then hand it different values at `docker run`. The image never needs a rebuild to point at a new API,
flip a flag, or move from staging to production.

```bash
docker run -e NEXT_PUBLIC_API_URL=https://staging.example.com my-app
docker run -e NEXT_PUBLIC_API_URL=https://api.example.com my-app
```

## Prepare the app

Render `PublicEnvScript` (or `PublicEnvProvider`) in the root layout, as in the [quick start](/guide/quick-start). Then
turn on standalone output so Next.js emits a self-contained `server.js` with only the files it needs:

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
}

export default nextConfig
```

::: warning Read public values through next-dynenv

Use `env()`, `useEnvContext()`, or `envParsers` for public values. A literal `process.env.NEXT_PUBLIC_API_URL` in client
code is still replaced by Next.js at build time, and that value ships inside the image.

:::

## Dockerfile

This is a three-stage build: install, build, then a slim runtime image that runs as a non-root user. It uses npm; swap
in your package manager's install and build commands if you use pnpm, Yarn, or Bun.

```dockerfile
FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# The standalone server binds to $HOSTNAME, which Docker sets to the container id
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Drop this line if your app has no public/ directory
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

The build stage needs no `NEXT_PUBLIC_*` values. They arrive when the container starts.

Keep local env files out of the build context so the image only ever sees what you pass at run time:

```text
# .dockerignore
.env*
.next
node_modules
.git
```

## Expose unprefixed variables

If your platform hands you `API_URL` rather than `NEXT_PUBLIC_API_URL`, call [`makeEnvPublic()`](/api/make-env-public)
from `instrumentation.ts`. Next.js runs `register()` once when the server starts, in every output mode:

```ts
// instrumentation.ts (or src/instrumentation.ts)
import { makeEnvPublic } from 'next-dynenv'

export function register() {
    makeEnvPublic(['API_URL', 'APP_NAME'])
}
```

::: danger Not in next.config

A standalone `server.js` embeds a serialized copy of your config and never evaluates `next.config.ts` again. A
`makeEnvPublic()` call there runs during `next build` only, so the container never sees the copied variables.

:::

## Run the container

```bash
docker build -t my-app .

docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  -e NEXT_PUBLIC_APP_NAME="My App" \
  -e DATABASE_URL=postgres://user:pass@db:5432/app \
  my-app
```

Or keep the values in a file outside the image:

```bash
docker run -p 3000:3000 --env-file ./production.env my-app
```

To check what the browser received, open the app and run `window.__ENV` in the devtools console.

## Docker Compose

```yaml
# compose.yaml
services:
    app:
        build: .
        ports:
            - '3000:3000'
        environment:
            NEXT_PUBLIC_API_URL: https://api.example.com
            NEXT_PUBLIC_APP_NAME: My App
            DATABASE_URL: postgres://app:app@db:5432/app
        depends_on:
            - db

    db:
        image: postgres:17
        environment:
            POSTGRES_DB: app
            POSTGRES_USER: app
            POSTGRES_PASSWORD: app
        volumes:
            - db-data:/var/lib/postgresql/data

volumes:
    db-data:
```

Layer an override file per environment and the same image picks up different values:

```yaml
# compose.staging.yaml
services:
    app:
        environment:
            NEXT_PUBLIC_API_URL: https://staging.example.com
```

```bash
docker compose -f compose.yaml -f compose.staging.yaml up
```

## Kubernetes

Put public values in a ConfigMap and secrets in a Secret, then load both into the container:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: my-app-config
data:
    NEXT_PUBLIC_API_URL: https://api.example.com
    NEXT_PUBLIC_APP_NAME: My App
---
apiVersion: v1
kind: Secret
metadata:
    name: my-app-secrets
type: Opaque
stringData:
    DATABASE_URL: postgres://user:pass@db:5432/app
    API_SECRET_KEY: replace-me
---
apiVersion: apps/v1
kind: Deployment
metadata:
    name: my-app
spec:
    replicas: 3
    selector:
        matchLabels:
            app: my-app
    template:
        metadata:
            labels:
                app: my-app
        spec:
            containers:
                - name: app
                  image: registry.example.com/my-app:1.4.0
                  ports:
                      - containerPort: 3000
                  envFrom:
                      - configMapRef:
                            name: my-app-config
                      - secretRef:
                            name: my-app-secrets
```

Environment variables are read when a container starts. After you edit the ConfigMap or Secret, restart the pods; no
rebuild is involved:

```bash
kubectl rollout restart deployment/my-app
```

## Health checks

A route handler makes a cheap readiness probe and confirms which config the container booted with:

```ts
// app/api/health/route.ts
import { env } from 'next-dynenv'

export function GET() {
    return Response.json({ status: 'ok', app: env('NEXT_PUBLIC_APP_NAME', 'unknown') })
}
```

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1
```

## Next steps

- [Other platforms](/guide/other-platforms): Fly.io, Cloud Run, ECS, and friends
- [Making env public](/guide/making-env-public): more on `makeEnvPublic()`
- [Security](/guide/security): what is safe to send to the browser
