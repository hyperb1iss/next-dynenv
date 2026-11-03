# Changelog

Release notes live on **[GitHub Releases](https://github.com/hyperb1iss/next-dynenv/releases)**. Every release is cut by
the `Release` workflow in GitHub Actions, which bumps the version, publishes to npm with provenance, and generates the
notes from the commits since the previous tag.

## 4.x

`next-dynenv` 4.0.0 was the first release under this name. It shipped to npm without a GitHub release, so the
[v4.0.1 notes](https://github.com/hyperb1iss/next-dynenv/releases/tag/v4.0.1) are the place to read about the 4.x line:
the rename, Next.js 15 and 16 support, the move to `connection()` for dynamic rendering, `envParsers`, and the escaped,
frozen `window.__ENV`.

Coming from `next-runtime-env` 3.x:

- Install `next-dynenv` and change your imports.
- Upgrade to Next.js 15 or 16 and React 19. The App Router is required.
- `env()`, `PublicEnvScript`, `EnvScript`, `PublicEnvProvider`, `EnvProvider`, `useEnvContext()`, and `makeEnvPublic()`
  keep their shapes.

## 3.x and earlier

Versions 1.x through 3.x were released as `next-runtime-env` by Expatfile.tax LLC. Their history lives in the
[original repository](https://github.com/expatfile/next-runtime-env/releases).
