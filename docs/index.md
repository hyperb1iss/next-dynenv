---
layout: home

hero:
    name: next-dynenv
    text: Runtime Environment Variables for Next.js
    tagline: Build once, deploy anywhere. Change your environment without rebuilding your app.
    actions:
        - theme: brand
          text: Get Started
          link: /guide/
        - theme: alt
          text: View on GitHub
          link: https://github.com/hyperb1iss/next-dynenv

features:
    - icon: ⚡
      title: Runtime Configuration
      details:
          Change environment variables without rebuilding. Build once, deploy to development, staging, and production
          with different configs. Perfect for Docker, Kubernetes, and modern CI/CD workflows.
    - icon: 🔒
      title: Secure by Default
      details:
          XSS protection via JSON escaping, immutable values with Object.freeze, and strict NEXT_PUBLIC_ prefix
          enforcement. Your secrets stay secret.
    - icon: 🎯
      title: Type-Safe Parsers
      details:
          Convert environment strings to booleans, numbers, arrays, JSON, URLs, and enums with full TypeScript support.
          Stop wrestling with string values.
    - icon: 🌐
      title: Works Everywhere
      details:
          One consistent API across server components, client components, API routes, and middleware. Zero mental
          overhead.
    - icon: 📦
      title: Zero Config
      details:
          Drop in PublicEnvScript, start calling env(). No build configuration, no webpack plugins, no complexity. It
          just works.
    - icon: 🚀
      title: Next.js 15/16 Ready
      details:
          Fully compatible with the latest Next.js features including async server components and React 19. Future-proof
          your stack.
---
