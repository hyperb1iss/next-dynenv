# Other Platforms

Deploy next-dynenv to Railway, Fly.io, Render, and more.

## Railway

### Setup

```bash
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node server.js"
```

### Environment Variables

Set in Railway dashboard or CLI:

```bash
railway variables set NEXT_PUBLIC_API_URL=https://api.example.com
railway variables set NEXT_PUBLIC_APP_NAME=MyApp
```

### Dockerfile Deployment

```bash
# Use the Docker deployment guide
railway up --dockerfile
```

## Fly.io

### fly.toml

```toml
# fly.toml
app = "my-nextjs-app"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[env]
  NODE_ENV = "production"
  PORT = "3000"
```

### Setting Secrets

```bash
# Set environment variables
fly secrets set NEXT_PUBLIC_API_URL=https://api.example.com
fly secrets set NEXT_PUBLIC_APP_NAME=MyApp
fly secrets set DATABASE_URL=postgres://...
```

### Deploy

```bash
fly deploy
```

## Render

### render.yaml

```yaml
# render.yaml
services:
    - type: web
      name: my-nextjs-app
      env: node
      buildCommand: pnpm install && pnpm build
      startCommand: node .next/standalone/server.js
      envVars:
          - key: NEXT_PUBLIC_API_URL
            value: https://api.example.com
          - key: NEXT_PUBLIC_APP_NAME
            value: MyApp
          - key: DATABASE_URL
            fromDatabase:
                name: mydb
                property: connectionString
```

### Environment Groups

Use environment groups for shared variables:

```yaml
envVars:
    - fromGroup: production-env
```

## AWS (ECS/Fargate)

### Task Definition

```json
{
    "containerDefinitions": [
        {
            "name": "nextjs-app",
            "image": "your-registry/my-nextjs-app:latest",
            "portMappings": [
                {
                    "containerPort": 3000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "NEXT_PUBLIC_API_URL",
                    "value": "https://api.example.com"
                },
                {
                    "name": "NEXT_PUBLIC_APP_NAME",
                    "value": "MyApp"
                }
            ],
            "secrets": [
                {
                    "name": "DATABASE_URL",
                    "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:db-url"
                }
            ]
        }
    ]
}
```

## Google Cloud Run

### Deploy Command

```bash
gcloud run deploy my-nextjs-app \
  --image gcr.io/my-project/my-nextjs-app \
  --set-env-vars NEXT_PUBLIC_API_URL=https://api.example.com \
  --set-env-vars NEXT_PUBLIC_APP_NAME=MyApp \
  --platform managed \
  --region us-central1
```

### Using Secret Manager

```bash
gcloud run deploy my-nextjs-app \
  --image gcr.io/my-project/my-nextjs-app \
  --set-secrets DATABASE_URL=db-url:latest \
  --platform managed
```

## Azure Container Apps

### Deployment

```yaml
# azure-container-app.yaml
properties:
    configuration:
        ingress:
            external: true
            targetPort: 3000
    template:
        containers:
            - name: nextjs-app
              image: myregistry.azurecr.io/my-nextjs-app:latest
              env:
                  - name: NEXT_PUBLIC_API_URL
                    value: https://api.example.com
                  - name: NEXT_PUBLIC_APP_NAME
                    value: MyApp
                  - name: DATABASE_URL
                    secretRef: db-url
```

## DigitalOcean App Platform

### app.yaml

```yaml
# .do/app.yaml
name: my-nextjs-app
services:
    - name: web
      dockerfile_path: Dockerfile
      http_port: 3000
      instance_count: 1
      instance_size_slug: basic-xxs
      envs:
          - key: NEXT_PUBLIC_API_URL
            value: https://api.example.com
          - key: NEXT_PUBLIC_APP_NAME
            value: MyApp
          - key: DATABASE_URL
            scope: RUN_TIME
            type: SECRET
```

## Heroku

### Procfile

```
web: node .next/standalone/server.js
```

### Config Vars

```bash
heroku config:set NEXT_PUBLIC_API_URL=https://api.example.com
heroku config:set NEXT_PUBLIC_APP_NAME=MyApp
```

## Coolify

Self-hosted PaaS alternative:

```yaml
# docker-compose.yml for Coolify
services:
    app:
        build: .
        environment:
            - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
            - NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
```

Set variables in Coolify's UI for each environment.

## Platform Comparison

| Platform  | Docker | Environment UI | Secrets | Auto-scaling |
| --------- | ------ | -------------- | ------- | ------------ |
| Vercel    | No     | Yes            | Yes     | Yes          |
| Railway   | Yes    | Yes            | Yes     | Yes          |
| Fly.io    | Yes    | CLI            | Yes     | Yes          |
| Render    | Yes    | Yes            | Yes     | Yes          |
| AWS ECS   | Yes    | No             | Yes     | Yes          |
| Cloud Run | Yes    | CLI            | Yes     | Yes          |

## General Tips

### 1. Use Standalone Output

Always enable standalone for smaller deployments:

```js
// next.config.js
module.exports = {
    output: 'standalone',
}
```

### 2. Health Checks

Add a health endpoint for all platforms:

```ts
// app/api/health/route.ts
export function GET() {
    return Response.json({ status: 'ok' })
}
```

### 3. Graceful Shutdown

Handle shutdown signals:

```js
// server.js (if custom)
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...')
    process.exit(0)
})
```

## Next Steps

- [Docker Deployment](/guide/docker) - Detailed Docker guide
- [Security](/guide/security) - Security best practices
- [API Reference](/api/) - Full API documentation
