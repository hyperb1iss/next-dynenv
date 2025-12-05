---
layout: home

hero:
    name: next-dynenv
    text: Dynamic Runtime Environment Variables
    tagline: Populate your Next.js environment at runtime, not build time
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
          Change environment variables without rebuilding. Perfect for Docker, Kubernetes, and multi-environment
          deployments.
    - icon: 🔒
      title: Secure by Default
      details:
          XSS protection via JSON escaping, immutable values with Object.freeze, and strict NEXT_PUBLIC_ prefix
          enforcement.
    - icon: 🎯
      title: Type-Safe Parsers
      details:
          Convert environment strings to booleans, numbers, arrays, JSON, URLs, and enums with full TypeScript support.
    - icon: 🌐
      title: Isomorphic Design
      details: Works seamlessly on server, client, and middleware. One API everywhere.
    - icon: 📦
      title: Zero Config
      details: Works out of the box with sensible defaults. Just add the script component and start using env().
    - icon: 🚀
      title: Next.js 15/16 Ready
      details: Fully compatible with the latest Next.js features including async server components.
---
