[![npm version][npm-img]][npm-url] [![GitHub][github-img]][github-url] [![License][license-img]][license-url]

# 🌐 Next.js Runtime Environment Configuration

**Effortlessly populate your environment at runtime, not just at build time, with `@hyperb1iss/next-runtime-env`.**

> **Note:** This is a fork of [expatfile/next-runtime-env](https://github.com/expatfile/next-runtime-env) upgraded to Next.js 15 and React 19. The original project appears unmaintained. All credit for the original implementation goes to Expatfile.tax LLC.

🌟 **Highlights:**
- **Isomorphic Design:** Works seamlessly on both server and browser, and even in middleware.
- **Next.js 15 & React 19 Ready:** Fully compatible with the latest Next.js features.
- **`.env` Friendly:** Use `.env` files during development, just like standard Next.js.

### 🤔 Why `next-runtime-env`?

In the modern software development landscape, the "[Build once, deploy many][build-once-deploy-many-link]" philosophy is key. This principle, essential for easy deployment and testability, is a [cornerstone of continuous delivery][fundamental-principle-link] and is embraced by the [twelve-factor methodology][twelve-factor-link]. However, front-end development, particularly with Next.js, often lacks support for this - requiring separate builds for different environments. `next-runtime-env` is our solution to bridge this gap in Next.js.

### 📦 Introducing `next-runtime-env`

`next-runtime-env` dynamically injects environment variables into your Next.js application at runtime. This approach adheres to the "build once, deploy many" principle, allowing the same build to be used across various environments without rebuilds.

### 🤝 Compatibility Notes

- **Next.js 15:** Use `@hyperb1iss/next-runtime-env@4.x` for Next.js 15 and React 19 with modern async server components.
- **Next.js 14 (original project):** Use `next-runtime-env@3.x` for optimal caching support.
- **Next.js 13 (original project):** Opt for `next-runtime-env@2.x`, tailored for the App Router.
- **Next.js 12/13 Page Router (original project):** Use `next-runtime-env@1.x`.

### 🔖 Version Guide

This fork starts at version **4.x** to clearly differentiate from the original project:

- **@hyperb1iss/next-runtime-env@4.x:** Next.js 15 & React 19 with modern async server components

Original project versions (unmaintained):
- **next-runtime-env@3.x:** Next.js 14 with advanced caching
- **next-runtime-env@2.x:** Next.js 13 App Router
- **next-runtime-env@1.x:** Next.js 12/13 Pages Router

### 📦 Installation

```bash
npm install @hyperb1iss/next-runtime-env
# or
pnpm add @hyperb1iss/next-runtime-env
# or
yarn add @hyperb1iss/next-runtime-env
```

### 🚀 Getting Started

In your `app/layout.tsx`, add:

```js
// app/layout.tsx
import { PublicEnvScript } from '@hyperb1iss/next-runtime-env';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

The `PublicEnvScript` component automatically exposes all environment variables prefixed with `NEXT_PUBLIC_` to the browser. For custom variable exposure, refer to [EXPOSING_CUSTOM_ENV.md](docs/EXPOSING_CUSTOM_ENV.md).

### 🧑‍💻 Usage

Access your environment variables easily:

```tsx
// app/client-page.tsx
'use client';
import { env } from '@hyperb1iss/next-runtime-env';

export default function SomePage() {
  const NEXT_PUBLIC_FOO = env('NEXT_PUBLIC_FOO');
  return <main>NEXT_PUBLIC_FOO: {NEXT_PUBLIC_FOO}</main>;
}
```

### 🛠 Utilities

Need to expose non-prefixed environment variables to the browser? Check out [MAKING_ENV_PUBLIC.md](docs/MAKING_ENV_PUBLIC.md).

### 👷 Maintenance

This fork is maintained by [Stefanie Jane (@hyperb1iss)](https://github.com/hyperb1iss).

### 📚 Acknowledgments

- **Original Project:** [next-runtime-env](https://github.com/expatfile/next-runtime-env) by [Expatfile.tax](https://expatfile.tax) - All credit for the original implementation and core concepts
- **Inspiration:** [react-env](https://github.com/andrewmclagan/react-env) project
- **Context Provider:** Thanks to @andonirdgz for the innovative context provider idea

---

[npm-img]: https://img.shields.io/npm/v/@hyperb1iss/next-runtime-env
[npm-url]: https://www.npmjs.com/package/@hyperb1iss/next-runtime-env
[github-img]: https://img.shields.io/github/stars/hyperb1iss/next-runtime-env?style=social
[github-url]: https://github.com/hyperb1iss/next-runtime-env
[license-img]: https://img.shields.io/npm/l/@hyperb1iss/next-runtime-env
[license-url]: https://github.com/hyperb1iss/next-runtime-env/blob/main/LICENSE.md
[build-once-deploy-many-link]: https://www.mikemcgarr.com/blog/build-once-deploy-many.html
[fundamental-principle-link]: https://cloud.redhat.com/blog/build-once-deploy-anywhere
[twelve-factor-link]: https://12factor.net
