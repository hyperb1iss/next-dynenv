import { afterEach, describe, expect, it, vi } from 'vitest'
import { env, requireEnv, serverOnly } from './env'

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

describe('serverOnly()', () => {
    afterEach(() => {
        delete process.env.SECRET_KEY
        delete process.env.DATABASE_URL
    })

    // In jsdom, window always exists, so IS_BROWSER is true
    // These tests verify browser behavior (returns fallback)

    it('should return fallback in browser context', () => {
        // window exists in jsdom, so this simulates browser
        expect(serverOnly('SECRET_KEY', 'fallback-value')).toEqual('fallback-value')
    })

    it('should return undefined when no fallback provided in browser', () => {
        expect(serverOnly('SECRET_KEY')).toBeUndefined()
    })

    it('should not read process.env in browser context', () => {
        process.env.SECRET_KEY = 'actual-secret'
        // Even though the env var exists, browser should return fallback
        expect(serverOnly('SECRET_KEY', 'fallback')).toEqual('fallback')
    })

    // Test server behavior by re-importing module without window
    describe('server context', () => {
        it('should return process.env value on server', async () => {
            // Save original window
            const originalWindow = globalThis.window

            // Remove window to simulate server
            // @ts-expect-error - intentionally removing window
            delete globalThis.window

            // Reset module cache and re-import
            vi.resetModules()
            const { serverOnly: serverOnlyServer } = await import('./env')

            process.env.SECRET_KEY = 'server-secret'
            expect(serverOnlyServer('SECRET_KEY')).toEqual('server-secret')

            // Restore window
            globalThis.window = originalWindow
            vi.resetModules()
        })

        it('should return fallback when env var undefined on server', async () => {
            const originalWindow = globalThis.window
            // @ts-expect-error - intentionally removing window
            delete globalThis.window

            vi.resetModules()
            const { serverOnly: serverOnlyServer } = await import('./env')

            expect(serverOnlyServer('NONEXISTENT_VAR', 'default')).toEqual('default')

            globalThis.window = originalWindow
            vi.resetModules()
        })

        it('should return undefined when no fallback and env var undefined on server', async () => {
            const originalWindow = globalThis.window
            // @ts-expect-error - intentionally removing window
            delete globalThis.window

            vi.resetModules()
            const { serverOnly: serverOnlyServer } = await import('./env')

            expect(serverOnlyServer('NONEXISTENT_VAR')).toBeUndefined()

            globalThis.window = originalWindow
            vi.resetModules()
        })
    })
})
