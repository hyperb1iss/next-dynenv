import { envParsers } from './parsers'

declare global {
    var mockWindow: (envVars: Record<string, string>) => void
    var unmockWindow: () => void
}

describe('envParsers', () => {
    afterEach(() => {
        process.env = {}
        unmockWindow()
    })

    describe('boolean()', () => {
        it('should return true for "true"', () => {
            process.env.NEXT_PUBLIC_DEBUG = 'true'
            expect(envParsers.boolean('NEXT_PUBLIC_DEBUG')).toBe(true)
        })

        it('should return true for "1"', () => {
            process.env.NEXT_PUBLIC_DEBUG = '1'
            expect(envParsers.boolean('NEXT_PUBLIC_DEBUG')).toBe(true)
        })

        it('should return true for "yes"', () => {
            process.env.NEXT_PUBLIC_DEBUG = 'yes'
            expect(envParsers.boolean('NEXT_PUBLIC_DEBUG')).toBe(true)
        })

        it('should return true for "on"', () => {
            process.env.NEXT_PUBLIC_DEBUG = 'on'
            expect(envParsers.boolean('NEXT_PUBLIC_DEBUG')).toBe(true)
        })

        it('should be case-insensitive', () => {
            process.env.NEXT_PUBLIC_DEBUG = 'TRUE'
            expect(envParsers.boolean('NEXT_PUBLIC_DEBUG')).toBe(true)

            process.env.NEXT_PUBLIC_DEBUG = 'Yes'
            expect(envParsers.boolean('NEXT_PUBLIC_DEBUG')).toBe(true)
        })

        it('should return false for "false"', () => {
            process.env.NEXT_PUBLIC_DEBUG = 'false'
            expect(envParsers.boolean('NEXT_PUBLIC_DEBUG')).toBe(false)
        })

        it('should return false for "0"', () => {
            process.env.NEXT_PUBLIC_DEBUG = '0'
            expect(envParsers.boolean('NEXT_PUBLIC_DEBUG')).toBe(false)
        })

        it('should return default false when undefined', () => {
            expect(envParsers.boolean('NEXT_PUBLIC_MISSING')).toBe(false)
        })

        it('should return custom default when undefined', () => {
            expect(envParsers.boolean('NEXT_PUBLIC_MISSING', true)).toBe(true)
        })

        it('should work in browser context', () => {
            mockWindow({ NEXT_PUBLIC_DEBUG: 'true' })
            expect(envParsers.boolean('NEXT_PUBLIC_DEBUG')).toBe(true)
        })
    })

    describe('number()', () => {
        it('should parse integers', () => {
            process.env.NEXT_PUBLIC_PORT = '3000'
            expect(envParsers.number('NEXT_PUBLIC_PORT')).toBe(3000)
        })

        it('should parse floats', () => {
            process.env.NEXT_PUBLIC_RATIO = '3.14'
            expect(envParsers.number('NEXT_PUBLIC_RATIO')).toBe(3.14)
        })

        it('should parse negative numbers', () => {
            process.env.NEXT_PUBLIC_OFFSET = '-10'
            expect(envParsers.number('NEXT_PUBLIC_OFFSET')).toBe(-10)
        })

        it('should return default 0 when undefined', () => {
            expect(envParsers.number('NEXT_PUBLIC_MISSING')).toBe(0)
        })

        it('should return custom default when undefined', () => {
            expect(envParsers.number('NEXT_PUBLIC_MISSING', 8080)).toBe(8080)
        })

        it('should throw for non-numeric values', () => {
            process.env.NEXT_PUBLIC_PORT = 'abc'
            expect(() => envParsers.number('NEXT_PUBLIC_PORT')).toThrow(
                "Environment variable 'NEXT_PUBLIC_PORT' is not a valid number: 'abc'",
            )
        })

        it('should work in browser context', () => {
            mockWindow({ NEXT_PUBLIC_PORT: '3000' })
            expect(envParsers.number('NEXT_PUBLIC_PORT')).toBe(3000)
        })
    })

    describe('array()', () => {
        it('should split comma-separated values', () => {
            process.env.NEXT_PUBLIC_FEATURES = 'auth,payments,analytics'
            expect(envParsers.array('NEXT_PUBLIC_FEATURES')).toEqual(['auth', 'payments', 'analytics'])
        })

        it('should trim whitespace', () => {
            process.env.NEXT_PUBLIC_FEATURES = 'auth , payments , analytics'
            expect(envParsers.array('NEXT_PUBLIC_FEATURES')).toEqual(['auth', 'payments', 'analytics'])
        })

        it('should filter empty strings', () => {
            process.env.NEXT_PUBLIC_FEATURES = 'auth,,payments,'
            expect(envParsers.array('NEXT_PUBLIC_FEATURES')).toEqual(['auth', 'payments'])
        })

        it('should return empty array for empty string', () => {
            process.env.NEXT_PUBLIC_FEATURES = ''
            expect(envParsers.array('NEXT_PUBLIC_FEATURES')).toEqual([])
        })

        it('should return default empty array when undefined', () => {
            expect(envParsers.array('NEXT_PUBLIC_MISSING')).toEqual([])
        })

        it('should return custom default when undefined', () => {
            expect(envParsers.array('NEXT_PUBLIC_MISSING', ['default'])).toEqual(['default'])
        })

        it('should work in browser context', () => {
            mockWindow({ NEXT_PUBLIC_FEATURES: 'a,b,c' })
            expect(envParsers.array('NEXT_PUBLIC_FEATURES')).toEqual(['a', 'b', 'c'])
        })
    })

    describe('json()', () => {
        it('should parse valid JSON objects', () => {
            process.env.NEXT_PUBLIC_CONFIG = '{"api":"https://api.example.com","timeout":5000}'
            expect(envParsers.json('NEXT_PUBLIC_CONFIG')).toEqual({
                api: 'https://api.example.com',
                timeout: 5000,
            })
        })

        it('should parse JSON arrays', () => {
            process.env.NEXT_PUBLIC_LIST = '["a","b","c"]'
            expect(envParsers.json('NEXT_PUBLIC_LIST')).toEqual(['a', 'b', 'c'])
        })

        it('should return default when undefined', () => {
            expect(envParsers.json('NEXT_PUBLIC_MISSING', { default: true })).toEqual({ default: true })
        })

        it('should throw when undefined with no default', () => {
            expect(() => envParsers.json('NEXT_PUBLIC_MISSING')).toThrow(
                "Required environment variable 'NEXT_PUBLIC_MISSING' is not defined",
            )
        })

        it('should throw for invalid JSON', () => {
            process.env.NEXT_PUBLIC_CONFIG = 'not-json'
            expect(() => envParsers.json('NEXT_PUBLIC_CONFIG')).toThrow(
                "Environment variable 'NEXT_PUBLIC_CONFIG' is not valid JSON",
            )
        })

        it('should work in browser context', () => {
            mockWindow({ NEXT_PUBLIC_CONFIG: '{"key":"value"}' })
            expect(envParsers.json('NEXT_PUBLIC_CONFIG')).toEqual({ key: 'value' })
        })
    })

    describe('url()', () => {
        it('should validate valid URLs', () => {
            process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/v1'
            expect(envParsers.url('NEXT_PUBLIC_API_URL')).toBe('https://api.example.com/v1')
        })

        it('should accept http URLs', () => {
            process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
            expect(envParsers.url('NEXT_PUBLIC_API_URL')).toBe('http://localhost:3000')
        })

        it('should return default when undefined', () => {
            expect(envParsers.url('NEXT_PUBLIC_MISSING', 'https://default.com')).toBe('https://default.com')
        })

        it('should throw when undefined with no default', () => {
            expect(() => envParsers.url('NEXT_PUBLIC_MISSING')).toThrow(
                "Required environment variable 'NEXT_PUBLIC_MISSING' is not defined",
            )
        })

        it('should throw for invalid URLs', () => {
            process.env.NEXT_PUBLIC_API_URL = 'not-a-url'
            expect(() => envParsers.url('NEXT_PUBLIC_API_URL')).toThrow(
                "Environment variable 'NEXT_PUBLIC_API_URL' is not a valid URL",
            )
        })

        it('should work in browser context', () => {
            mockWindow({ NEXT_PUBLIC_API_URL: 'https://api.example.com' })
            expect(envParsers.url('NEXT_PUBLIC_API_URL')).toBe('https://api.example.com')
        })
    })
})
