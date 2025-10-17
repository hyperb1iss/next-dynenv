import '@testing-library/jest-dom'

import { render, waitFor } from '@testing-library/react'

import { PublicEnvScript } from './public-env-script'

jest.mock('next/script', () => // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ children, ...props }: any) => <script {...props}>{children}</script>)

beforeEach(() => {
    process.env = {}
})

afterEach(() => {
    process.env = {}
})

describe('PublicEnvScript', () => {
    it('should set a public env in the script', async () => {
        process.env = {
            NEXT_PUBLIC_FOO: 'foo-value',
        }

        const Component = await PublicEnvScript({})
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')?.textContent).toBe(
                `window['__ENV'] = {"NEXT_PUBLIC_FOO":"foo-value"}`,
            )
        })
    })

    it('should not set a private env in the script', async () => {
        process.env = {
            NEXT_PUBLIC_FOO: 'foo-value',
            BAR: 'bar-value',
        }

        const Component = await PublicEnvScript({})
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')?.textContent).toBe(
                `window['__ENV'] = {"NEXT_PUBLIC_FOO":"foo-value"}`,
            )
        })
    })

    it('should only set public env in the script', async () => {
        process.env = {
            NEXT_PUBLIC_FOO: 'foo-value',
            BAR: 'bar-value',
        }

        const Component = await PublicEnvScript({})
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')?.textContent).toBe(
                `window['__ENV'] = {"NEXT_PUBLIC_FOO":"foo-value"}`,
            )
        })
    })

    it("should set a nonce when it's available", async () => {
        process.env = {
            NEXT_PUBLIC_FOO: 'foo-value',
            BAR: 'bar-value',
        }

        const Component = await PublicEnvScript({ nonce: 'test-nonce-xyz' })
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')).toHaveAttribute('nonce')
        })
    })

    it("should not set a nonce when it's not available", async () => {
        process.env = {
            NEXT_PUBLIC_FOO: 'foo-value',
            BAR: 'bar-value',
        }

        const Component = await PublicEnvScript({})
        render(Component)

        await waitFor(() => {
            expect(document.querySelector('script')).not.toHaveAttribute('nonce')
        })
    })
})
