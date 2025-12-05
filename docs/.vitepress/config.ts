import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'next-dynenv',
    description: 'Dynamic runtime environment variables for Next.js',
    base: '/next-dynenv/',

    head: [
        ['meta', { name: 'theme-color', content: '#e135ff' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:title', content: 'next-dynenv Documentation' }],
        ['meta', { property: 'og:description', content: 'Dynamic runtime environment variables for Next.js' }],
    ],

    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/' },
            { text: 'API', link: '/api/' },
            { text: 'Examples', link: '/examples/' },
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Getting Started',
                    items: [
                        { text: 'Introduction', link: '/guide/' },
                        { text: 'Installation', link: '/guide/installation' },
                        { text: 'Quick Start', link: '/guide/quick-start' },
                    ],
                },
                {
                    text: 'Core Concepts',
                    items: [
                        { text: 'How It Works', link: '/guide/how-it-works' },
                        { text: 'Script Approach', link: '/guide/script-approach' },
                        { text: 'Context Approach', link: '/guide/context-approach' },
                    ],
                },
                {
                    text: 'Advanced',
                    items: [
                        { text: 'Custom Variables', link: '/guide/custom-variables' },
                        { text: 'Making Env Public', link: '/guide/making-env-public' },
                        { text: 'Security', link: '/guide/security' },
                    ],
                },
                {
                    text: 'Deployment',
                    items: [
                        { text: 'Docker', link: '/guide/docker' },
                        { text: 'Vercel', link: '/guide/vercel' },
                        { text: 'Other Platforms', link: '/guide/other-platforms' },
                    ],
                },
            ],
            '/api/': [
                {
                    text: 'API Reference',
                    items: [
                        { text: 'Overview', link: '/api/' },
                        { text: 'env()', link: '/api/env' },
                        { text: 'requireEnv()', link: '/api/require-env' },
                        { text: 'envParsers', link: '/api/parsers' },
                        { text: 'Components', link: '/api/components' },
                    ],
                },
            ],
            '/examples/': [
                {
                    text: 'Examples',
                    items: [
                        { text: 'Overview', link: '/examples/' },
                        { text: 'App Router (Script)', link: '/examples/app-router-script' },
                        { text: 'App Router (Context)', link: '/examples/app-router-context' },
                    ],
                },
            ],
        },

        socialLinks: [{ icon: 'github', link: 'https://github.com/hyperb1iss/next-dynenv' }],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024-2025 Stefanie Jane',
        },

        search: {
            provider: 'local',
        },
    },

    markdown: {
        theme: {
            light: 'github-light',
            dark: 'one-dark-pro',
        },
    },
})
