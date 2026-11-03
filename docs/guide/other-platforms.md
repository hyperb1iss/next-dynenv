# Other platforms

Any host that runs `next start` or the standalone `server.js` works the same way: build once, set variables on the
platform, and restart. A value change needs a restart or a new revision of the same image, never a rebuild.

## Before you deploy

- Render `PublicEnvScript` or `PublicEnvProvider` in the root layout.
- Read public values with `env()`, `useEnvContext()`, or `envParsers`, not literal `process.env.NEXT_PUBLIC_*` in client
  code (Next.js inlines those at build time).
- Copy unprefixed variables with [`makeEnvPublic()`](/api/make-env-public) in `instrumentation.ts`, not in
  `next.config`.
- For container hosts, use `output: 'standalone'` and the Dockerfile from the [Docker guide](/guide/docker).

## Where values live

| Platform             | Where to set variables                                 | Applying a change                            |
| -------------------- | ------------------------------------------------------ | -------------------------------------------- |
| Fly.io               | `fly secrets set`, or `[env]` in `fly.toml`            | Secrets: Machines restart on the same image  |
| Railway              | Service **Variables** tab                              | Apply the staged change; Railway redeploys   |
| Render               | Service **Environment** page                           | Save and redeploy from the dashboard         |
| Google Cloud Run     | `--set-env-vars`, `--update-env-vars`, `--set-secrets` | New revision from the same image             |
| AWS ECS / Fargate    | Task definition `environment` and `secrets`            | New task definition revision, service update |
| Azure Container Apps | `az containerapp update --set-env-vars`                | New revision from the same image             |
| Heroku               | `heroku config:set`                                    | Dynos restart with the same slug             |
| Kubernetes           | ConfigMap and Secret (see [Docker](/guide/docker))     | `kubectl rollout restart`                    |
| Vercel               | Project settings (see [Vercel](/guide/vercel))         | New deployment                               |

## Fly.io

Plain values can live in `fly.toml`; secrets go through the CLI:

```toml
# fly.toml
[env]
  NEXT_PUBLIC_API_URL = "https://api.example.com"
  NEXT_PUBLIC_APP_NAME = "My App"
```

```bash
fly secrets set DATABASE_URL=postgres://user:pass@db.internal:5432/app
```

`fly secrets set` restarts your Machines with the new value. Changes to `[env]` ship with the next `fly deploy`.

## Railway and Render

Both platforms manage variables per service in the dashboard. Add your `NEXT_PUBLIC_*` values and secrets there, then
apply the change so the service restarts with the new environment.

## Google Cloud Run

```bash
gcloud run deploy my-app \
  --image us-docker.pkg.dev/my-project/apps/my-app:1.4.0 \
  --set-env-vars NEXT_PUBLIC_API_URL=https://api.example.com,NEXT_PUBLIC_APP_NAME=MyApp \
  --set-secrets DATABASE_URL=database-url:latest
```

Change one value later without touching the image:

```bash
gcloud run services update my-app --update-env-vars NEXT_PUBLIC_API_URL=https://api-v2.example.com
```

Cloud Run sets `PORT`, and the standalone server listens on it.

## AWS ECS and Fargate

Set public values under `environment` and pull secrets from Secrets Manager or Parameter Store under `secrets`:

```json
{
    "containerDefinitions": [
        {
            "name": "my-app",
            "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.4.0",
            "portMappings": [{ "containerPort": 3000 }],
            "environment": [
                { "name": "NEXT_PUBLIC_API_URL", "value": "https://api.example.com" },
                { "name": "NEXT_PUBLIC_APP_NAME", "value": "My App" }
            ],
            "secrets": [
                {
                    "name": "DATABASE_URL",
                    "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:database-url"
                }
            ]
        }
    ]
}
```

Register a new task definition revision with the changed values and update the service. The image stays the same.

## Azure Container Apps

```bash
az containerapp update \
  --name my-app \
  --resource-group my-group \
  --set-env-vars NEXT_PUBLIC_API_URL=https://api.example.com
```

Each update creates a new revision from the same image.

## Heroku

Heroku runs your `start` script (`next start`), which reads `PORT` from the environment.

```bash
heroku config:set NEXT_PUBLIC_API_URL=https://api.example.com
```

Setting a config var restarts the dynos with the same slug.

## Build-and-host platforms

Platforms that build and host in one step tie variables to deployments, so a change there means a new deploy. Vercel is
covered in its [own guide](/guide/vercel).

On AWS Amplify Hosting, variables set in the console are only available during the build. To reach a server runtime,
Amplify's documentation has you write them into `.env.production` as part of the build commands, which means a value
change needs a new build there.

## Next steps

- [Docker](/guide/docker): Dockerfile, Compose, and Kubernetes
- [Security](/guide/security): what is safe to send to the browser
- [Troubleshooting](/guide/troubleshooting)
