import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

import silkcircuitDawn from './theme/silkcircuit-dawn.json' with { type: 'json' }
import silkcircuitNeon from './theme/silkcircuit-neon.json' with { type: 'json' }

const repo = 'https://github.com/hyperb1iss/next-dynenv'
const siteUrl = 'https://hyperb1iss.github.io/next-dynenv/'
const description = 'Runtime environment variables for Next.js. Build once, deploy anywhere.'

// SilkCircuit mark: a Neon purple diamond around a cyan core.
const favicon = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<rect width="32" height="32" rx="4" fill="#12101a"/>' +
        '<path d="M16 5 27 16 16 27 5 16Z" fill="none" stroke="#e135ff" stroke-width="3"/>' +
        '<path d="M16 12 20 16 16 20 12 16Z" fill="#80ffea"/>' +
        '</svg>',
)}`

export default defineConfig({
    vite: {
        plugins: [llmstxt()],
    },

    title: 'next-dynenv',
    description,
    base: '/next-dynenv/',
    appearance: 'dark',
    lastUpdated: true,
    sitemap: { hostname: siteUrl },

    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: favicon }],
        ['meta', { name: 'theme-color', content: '#12101a' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:site_name', content: 'next-dynenv' }],
        ['meta', { property: 'og:title', content: 'next-dynenv: runtime environment variables for Next.js' }],
        ['meta', { property: 'og:description', content: description }],
        ['meta', { property: 'og:url', content: siteUrl }],
        ['meta', { name: 'twitter:card', content: 'summary' }],
    ],

    markdown: {
        theme: {
            light: { ...silkcircuitDawn, type: 'light' as const },
            dark: { ...silkcircuitNeon, type: 'dark' as const },
        },
    },

    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
            { text: 'API', link: '/api/', activeMatch: '/api/' },
            { text: 'Examples', link: '/examples/', activeMatch: '/examples/' },
            { text: 'Releases', link: `${repo}/releases` },
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Getting started',
                    items: [
                        { text: 'Introduction', link: '/guide/' },
                        { text: 'Installation', link: '/guide/installation' },
                        { text: 'Quick start', link: '/guide/quick-start' },
                    ],
                },
                {
                    text: 'Core concepts',
                    items: [
                        { text: 'How it works', link: '/guide/how-it-works' },
                        { text: 'Script approach', link: '/guide/script-approach' },
                        { text: 'Context approach', link: '/guide/context-approach' },
                    ],
                },
                {
                    text: 'Going further',
                    items: [
                        { text: 'Custom variables', link: '/guide/custom-variables' },
                        { text: 'Making variables public', link: '/guide/making-env-public' },
                        { text: 'Security', link: '/guide/security' },
                        { text: 'Troubleshooting', link: '/guide/troubleshooting' },
                    ],
                },
                {
                    text: 'Deployment',
                    items: [
                        { text: 'Docker and Kubernetes', link: '/guide/docker' },
                        { text: 'Vercel', link: '/guide/vercel' },
                        { text: 'Other platforms', link: '/guide/other-platforms' },
                    ],
                },
            ],
            '/api/': [
                { text: 'Overview', link: '/api/' },
                {
                    text: 'Functions',
                    items: [
                        { text: 'env()', link: '/api/env' },
                        { text: 'requireEnv()', link: '/api/require-env' },
                        { text: 'serverOnly()', link: '/api/server-only' },
                        { text: 'envParsers', link: '/api/parsers' },
                        { text: 'makeEnvPublic()', link: '/api/make-env-public' },
                    ],
                },
                {
                    text: 'Components',
                    items: [{ text: 'Components and hooks', link: '/api/components' }],
                },
            ],
            '/examples/': [
                { text: 'Overview', link: '/examples/' },
                { text: 'Script approach', link: '/examples/app-router-script' },
                { text: 'Context approach', link: '/examples/app-router-context' },
            ],
        },

        outline: { level: [2, 3] },

        editLink: {
            pattern: `${repo}/edit/main/docs/:path`,
            text: 'Edit this page on GitHub',
        },

        socialLinks: [
            { icon: 'github', link: repo },
            { icon: 'npm', link: 'https://www.npmjs.com/package/next-dynenv' },
        ],

        footer: {
            message:
                'Released under the MIT License. Forked from <a href="https://github.com/expatfile/next-runtime-env">next-runtime-env</a> by Expatfile.tax LLC.',
            copyright: 'Copyright © 2025-present Stefanie Jane',
        },

        search: {
            provider: 'local',
        },
    },
})
