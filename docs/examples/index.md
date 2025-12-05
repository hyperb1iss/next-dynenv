# Examples

Explore working examples of next-dynenv in action.

## Official Examples

### [App Router with Script Approach](/examples/app-router-script)

The recommended approach using `PublicEnvScript` for injecting environment variables.

```tsx
// app/layout.tsx
import { PublicEnvScript } from 'next-dynenv'

export default function RootLayout({ children }) {
    return (
        <html>
            <head>
                <PublicEnvScript />
            </head>
            <body>{children}</body>
        </html>
    )
}
```

### [App Router with Context Approach](/examples/app-router-context)

Alternative approach using React Context for environment access.

```tsx
// app/layout.tsx
import { PublicEnvProvider } from 'next-dynenv'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <PublicEnvProvider>{children}</PublicEnvProvider>
            </body>
        </html>
    )
}
```

## GitHub Repository Examples

Full working examples are available in the repository:

- [with-app-router-script](https://github.com/hyperb1iss/next-dynenv/tree/development/examples/with-app-router-script) -
  Script approach with middleware
- [with-app-router-context](https://github.com/hyperb1iss/next-dynenv/tree/development/examples/with-app-router-context) -
  Context approach

## Quick Reference

| Approach | Best For                      | Component           |
| -------- | ----------------------------- | ------------------- |
| Script   | Most use cases, outside React | `PublicEnvScript`   |
| Context  | React-only, hook-based access | `PublicEnvProvider` |

## Running Examples Locally

```bash
# Clone the repo
git clone https://github.com/hyperb1iss/next-dynenv.git
cd next-dynenv

# Install dependencies
pnpm install

# Run an example
cd examples/with-app-router-script
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to see the example in action.
