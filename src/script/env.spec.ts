import { env } from './env'

const { headers } = jest.requireMock('next/headers') as { headers: jest.Mock }

declare global {
    var mockWindow: (envVars: Record<string, string>) => void
    var unmockWindow: () => void
}

describe('env()', () => {
    beforeEach(() => {
        headers.mockImplementation(() => new Headers())
    })

    afterEach(() => {
        delete process.env.FOO
        headers.mockReset()
        unmockWindow()
    })

    it('should return a value from the server', () => {
        process.env.FOO = 'foo'

        expect(env('FOO')).toEqual('foo')
    })

    it('should return a value from the browser', () => {
        mockWindow({ NEXT_PUBLIC_FOO: 'foo' })

        expect(env('NEXT_PUBLIC_FOO')).toEqual('foo')
    })

    it('should return undefined when variable does not exist on the server', () => {
        expect(env('BAM_BAM')).toEqual(undefined)
    })

    it('should return undefined when variable does not exist in the browser', () => {
        mockWindow({ NEXT_PUBLIC_FOO: 'foo' })

        expect(env('NEXT_PUBLIC_BAR')).toEqual(undefined)
    })

    it('should throw when trying to access a non public variable in the browser', () => {
        mockWindow({ NEXT_PUBLIC_FOO: 'foo' })

        expect(() => env('BAM_BAM')).toThrow(
            "Environment variable 'BAM_BAM' is not public and cannot be accessed in the browser.",
        )
    })

    it('should not throw when headers() is called outside a request scope', () => {
        headers.mockImplementation(() => {
            throw new Error(
                '`headers` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context',
            )
        })

        process.env.FOO = 'foo'

        expect(env('FOO')).toEqual('foo')
    })

    it('should rethrow unexpected errors from headers()', () => {
        headers.mockImplementation(() => {
            throw new Error('boom')
        })

        expect(() => env('FOO')).toThrow('boom')
    })
})
