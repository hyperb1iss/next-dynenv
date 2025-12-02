import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { escapeJsonForHtml } from '../helpers/escape-json-for-html'
import { EnvScript } from './env-script'

const headersMock = vi.hoisted(() => vi.fn(() => Promise.resolve(new Headers())))

vi.mock('next/headers', () => ({
    headers: headersMock,
}))

vi.mock('next/script', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ children, ...props }: any) => <script {...props}>{children}</script>,
}))

beforeEach(() => {
    process.env = {}
    headersMock.mockImplementation(() => Promise.resolve(new Headers()))
})

afterEach(() => {
    process.env = {}
    headersMock.mockReset()
})

describe('EnvScript', () => {
    it('should set the env in the script with Object.freeze', async () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }

        const Component = await EnvScript({ env })
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')?.textContent).toBe(
                `window['__ENV'] = Object.freeze(${escapeJsonForHtml(env)})`,
            )
        })
    })

    it("should set a nonce when it's available", async () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }
        const nonce = 'test-nonce-xyz'

        const Component = await EnvScript({ env, nonce })
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')).toHaveAttribute('nonce', nonce)
        })
    })

    it("should not set a nonce when it's not available", async () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }

        const Component = await EnvScript({ env })
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')).not.toHaveAttribute('nonce')
        })
    })

    it('should accept Next.js Script tag props', async () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }
        const nonce = 'test-nonce-xyz'
        const id = 'text-id-abc'

        const Component = await EnvScript({
            env,
            nextScriptProps: {
                strategy: 'afterInteractive',
                id,
            },
            nonce,
        })
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')).toHaveAttribute('nonce', nonce)
            expect(document.querySelector('script')).toHaveAttribute('id', id)
            expect(document.querySelector('script')?.textContent).toBe(
                `window['__ENV'] = Object.freeze(${escapeJsonForHtml(env)})`,
            )
        })
    })

    it('should not have Next.js Script props when a regular script tag is used', async () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }
        const id = 'text-id-abc'

        const Component = await EnvScript({
            disableNextScript: true,
            env,
            nextScriptProps: {
                id,
            },
        })
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')).not.toHaveAttribute('id', id)
        })
    })

    it('should get the nonce from the headers when the headerKey is provided', async () => {
        headersMock.mockImplementation(() => Promise.resolve(new Headers({ 'x-nonce': 'test-nonce-xyz' })))
        const env = { NODE_ENV: 'test' }

        const Component = await EnvScript({ env, nonce: { headerKey: 'x-nonce' } })
        render(Component)

        expect(headersMock).toHaveBeenCalled()
        await waitFor(() => {
            expect(document.querySelector('script')).toHaveAttribute('nonce', 'test-nonce-xyz')
        })
    })

    it('should fall back gracefully when headers throws outside a request scope', async () => {
        headersMock.mockImplementation(() => {
            throw new Error(
                '`headers` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context',
            )
        })
        const env = { NODE_ENV: 'test' }

        const Component = await EnvScript({ env, nonce: { headerKey: 'x-nonce' } })
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')).not.toHaveAttribute('nonce')
        })
    })

    it('should escape HTML special characters in env values', async () => {
        const env = { NEXT_PUBLIC_XSS: '</script><script>alert(1)</script>' }

        const Component = await EnvScript({ env })
        render(Component)

        await waitFor(() => {
            const content = document.querySelector('script')?.textContent
            expect(content).toContain('\\u003c/script\\u003e')
            expect(content).not.toContain('</script><script>')
        })
    })
})
