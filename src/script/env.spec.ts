import { afterEach, describe, expect, it } from 'vitest'
import { env, requireEnv } from './env'

declare global {
    var mockWindow: (envVars: Record<string, string>) => void
    var unmockWindow: () => void
}

describe('env()', () => {
    afterEach(() => {
        delete process.env.FOO
        delete process.env.NEXT_PUBLIC_FOO
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

        expect(() => env('BAM_BAM')).toThrow("Environment variable 'BAM_BAM' is not public")
    })

    it('should return default value when variable is undefined on server', () => {
        expect(env('MISSING_VAR', 'default-value')).toEqual('default-value')
    })

    it('should return default value when variable is undefined in browser', () => {
        mockWindow({ NEXT_PUBLIC_FOO: 'foo' })

        expect(env('NEXT_PUBLIC_MISSING', 'default-value')).toEqual('default-value')
    })

    it('should return actual value over default when variable exists', () => {
        process.env.FOO = 'actual-value'

        expect(env('FOO', 'default-value')).toEqual('actual-value')
    })
})

describe('requireEnv()', () => {
    afterEach(() => {
        delete process.env.FOO
        delete process.env.NEXT_PUBLIC_FOO
        unmockWindow()
    })

    it('should return value when variable exists on server', () => {
        process.env.FOO = 'foo'

        expect(requireEnv('FOO')).toEqual('foo')
    })

    it('should return value when variable exists in browser', () => {
        mockWindow({ NEXT_PUBLIC_FOO: 'foo' })

        expect(requireEnv('NEXT_PUBLIC_FOO')).toEqual('foo')
    })

    it('should throw when variable is undefined on server', () => {
        expect(() => requireEnv('MISSING_VAR')).toThrow("Required environment variable 'MISSING_VAR' is not defined.")
    })

    it('should throw when variable is undefined in browser', () => {
        mockWindow({ NEXT_PUBLIC_FOO: 'foo' })

        expect(() => requireEnv('NEXT_PUBLIC_MISSING')).toThrow(
            "Required environment variable 'NEXT_PUBLIC_MISSING' is not defined.",
        )
    })
})
