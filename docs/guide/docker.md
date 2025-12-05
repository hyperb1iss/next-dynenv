# Docker Deployment

Deploy a single Docker image across all environments.

## The Goal

Build once, deploy anywhere with different configurations:

```bash
# Same image, different environments
docker run -e NEXT_PUBLIC_API_URL=https://staging-api.com my-app
docker run -e NEXT_PUBLIC_API_URL=https://prod-api.com my-app
```

## Basic Dockerfile

```dockerfile
# Dockerfile
FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

## Next.js Configuration

Enable standalone output for smaller Docker images:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
}

module.exports = nextConfig
```

## Application Setup

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

## Running the Container

### With Environment Variables

```bash
# Build the image
docker build -t my-nextjs-app .

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  -e NEXT_PUBLIC_APP_NAME=MyApp \
  -e NEXT_PUBLIC_DEBUG=false \
  my-nextjs-app
```

### With Environment File

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_ANALYTICS_ID=UA-123456

# Run with env file
docker run -p 3000:3000 --env-file .env.production my-nextjs-app
```

## Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
    app:
        build: .
        ports:
            - '3000:3000'
        environment:
            - NEXT_PUBLIC_API_URL=https://api.example.com
            - NEXT_PUBLIC_APP_NAME=MyApp
            - NEXT_PUBLIC_DEBUG=false
            - DATABASE_URL=postgres://db:5432/myapp
        depends_on:
            - db

    db:
        image: postgres:15
        environment:
            POSTGRES_DB: myapp
            POSTGRES_USER: user
            POSTGRES_PASSWORD: password
        volumes:
            - postgres_data:/var/lib/postgresql/data

volumes:
    postgres_data:
```

### Multiple Environments

```yaml
# docker-compose.staging.yml
version: '3.8'

services:
    app:
        build: .
        environment:
            - NEXT_PUBLIC_API_URL=https://staging-api.example.com
            - NEXT_PUBLIC_ENV=staging
```

```yaml
# docker-compose.production.yml
version: '3.8'

services:
    app:
        build: .
        environment:
            - NEXT_PUBLIC_API_URL=https://api.example.com
            - NEXT_PUBLIC_ENV=production
```

```bash
# Run staging
docker compose -f docker-compose.yml -f docker-compose.staging.yml up

# Run production
docker compose -f docker-compose.yml -f docker-compose.production.yml up
```

## Kubernetes

### ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: app-config
data:
    NEXT_PUBLIC_API_URL: 'https://api.example.com'
    NEXT_PUBLIC_APP_NAME: 'MyApp'
    NEXT_PUBLIC_ENV: 'production'
```

### Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: nextjs-app
spec:
    replicas: 3
    selector:
        matchLabels:
            app: nextjs-app
    template:
        metadata:
            labels:
                app: nextjs-app
        spec:
            containers:
                - name: app
                  image: my-registry/my-nextjs-app:latest
                  ports:
                      - containerPort: 3000
                  envFrom:
                      - configMapRef:
                            name: app-config
                  env:
                      # Secrets should come from Secret resources
                      - name: DATABASE_URL
                        valueFrom:
                            secretKeyRef:
                                name: app-secrets
                                key: database-url
```

### Secret

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
    name: app-secrets
type: Opaque
stringData:
    database-url: 'postgres://user:pass@db:5432/myapp'
```

## Health Checks

Add a health endpoint:

```ts
// app/api/health/route.ts
import { env } from 'next-dynenv'

export function GET() {
    return Response.json({
        status: 'healthy',
        environment: env('NEXT_PUBLIC_ENV', 'unknown'),
        timestamp: new Date().toISOString(),
    })
}
```

Docker health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

## Multi-Stage Build Optimization

```dockerfile
# Optimized Dockerfile
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

## Next Steps

- [Vercel Deployment](/guide/vercel) - Deploy to Vercel
- [Other Platforms](/guide/other-platforms) - Railway, Fly.io, and more
- [Security](/guide/security) - Security best practices
