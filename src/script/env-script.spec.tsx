import '@testing-library/jest-dom'

import { render } from '@testing-library/react'

import { EnvScript } from './env-script'

const { headers } = jest.requireMock('next/headers') as { headers: jest.Mock }

jest.mock('next/script', () => // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ children, ...props }: any) => <script {...props}>{children}</script>)

beforeEach(() => {
    process.env = {}
    headers.mockImplementation(() => new Headers())
})

afterEach(() => {
    process.env = {}
    headers.mockReset()
})

describe('EnvScript', () => {
    it('should set the env in the script', () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }

        render(<EnvScript env={env} />)

        expect(document.querySelector('script')?.textContent).toBe(`window['__ENV'] = ${JSON.stringify(env)}`)
    })

    it("should set a nonce when it's available", () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }
        const nonce = 'test-nonce-xyz'

        render(<EnvScript env={env} nonce={nonce} />)

        expect(document.querySelector('script')).toHaveAttribute('nonce', nonce)
    })

    it("should not set a nonce when it's not available", () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }

        render(<EnvScript env={env} />)

        expect(document.querySelector('script')).not.toHaveAttribute('nonce')
    })

    it('should accept Next.js Script tag props', () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }
        const nonce = 'test-nonce-xyz'
        const id = 'text-id-abc'

        render(
            <EnvScript
                env={env}
                nextScriptProps={{
                    strategy: 'afterInteractive',
                    id,
                }}
                nonce={nonce}
            />,
        )

        expect(document.querySelector('script')).toHaveAttribute('nonce', nonce)
        expect(document.querySelector('script')).toHaveAttribute('id', id)
        expect(document.querySelector('script')?.textContent).toBe(`window['__ENV'] = ${JSON.stringify(env)}`)
    })

    it('should not have Next.js Script props when a regular script tag is used', () => {
        const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' }
        const id = 'text-id-abc'

        render(
            <EnvScript
                disableNextScript={true}
                env={env}
                nextScriptProps={{
                    id,
                }}
            />,
        )

        expect(document.querySelector('script')).not.toHaveAttribute('id', id)
    })

    it('should get the nonce from the headers when the headerKey is provided', () => {
        headers.mockImplementation(() => new Headers({ 'x-nonce': 'test-nonce-xyz' }))
        const env = { NODE_ENV: 'test' }

        render(<EnvScript env={env} nonce={{ headerKey: 'x-nonce' }} />)

        expect(headers).toHaveBeenCalled()
        expect(document.querySelector('script')).toHaveAttribute('nonce', 'test-nonce-xyz')
    })

    it('should fall back gracefully when headers throws outside a request scope', () => {
        headers.mockImplementation(() => {
            throw new Error(
                '`headers` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context',
            )
        })
        const env = { NODE_ENV: 'test' }

        render(<EnvScript env={env} nonce={{ headerKey: 'x-nonce' }} />)

        expect(document.querySelector('script')).not.toHaveAttribute('nonce')
    })

    it('should skip nonce when headers returns a promise', () => {
        headers.mockImplementation(() => Promise.resolve(new Headers({ 'x-nonce': 'test-nonce-xyz' })))
        const env = { NODE_ENV: 'test' }

        render(<EnvScript env={env} nonce={{ headerKey: 'x-nonce' }} />)

        expect(document.querySelector('script')).not.toHaveAttribute('nonce')
    })
})
