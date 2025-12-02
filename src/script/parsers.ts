import { env } from './env'

/**
 * Type-safe environment variable parsers for common data types.
 *
 * These utilities convert string environment variables to their appropriate
 * types with sensible defaults and error handling.
 *
 * @example
 * ```ts
 * import { envParsers } from '@hyperb1iss/next-runtime-env';
 *
 * const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG');
 * const port = envParsers.number('NEXT_PUBLIC_PORT', 3000);
 * const features = envParsers.array('NEXT_PUBLIC_FEATURES');
 * ```
 */
export const envParsers = {
    /**
     * Parses an environment variable as a boolean.
     *
     * Recognizes these truthy values (case-insensitive):
     * - `'true'`, `'1'`, `'yes'`, `'on'`
     *
     * All other values (including undefined) return the default or `false`.
     *
     * @param key - The environment variable name
     * @param defaultValue - Default value if undefined (defaults to `false`)
     * @returns The parsed boolean value
     *
     * @example
     * ```ts
     * // NEXT_PUBLIC_DEBUG=true → true
     * // NEXT_PUBLIC_DEBUG=1 → true
     * // NEXT_PUBLIC_DEBUG=yes → true
     * // NEXT_PUBLIC_DEBUG=false → false
     * // NEXT_PUBLIC_DEBUG undefined → false
     *
     * const debug = envParsers.boolean('NEXT_PUBLIC_DEBUG');
     * const enabled = envParsers.boolean('NEXT_PUBLIC_FEATURE', true);
     * ```
     */
    boolean(key: string, defaultValue = false): boolean {
        const value = env(key)
        if (value === undefined) return defaultValue
        return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
    },

    /**
     * Parses an environment variable as a number.
     *
     * @param key - The environment variable name
     * @param defaultValue - Default value if undefined or invalid (defaults to `0`)
     * @returns The parsed number value
     *
     * @throws {Error} If the value is defined but not a valid number
     *
     * @example
     * ```ts
     * // NEXT_PUBLIC_PORT=3000 → 3000
     * // NEXT_PUBLIC_PORT=3.14 → 3.14
     * // NEXT_PUBLIC_PORT undefined → 0 (or default)
     * // NEXT_PUBLIC_PORT=abc → throws Error
     *
     * const port = envParsers.number('NEXT_PUBLIC_PORT', 3000);
     * const ratio = envParsers.number('NEXT_PUBLIC_RATIO', 1.0);
     * ```
     */
    number(key: string, defaultValue = 0): number {
        const value = env(key)
        if (value === undefined) return defaultValue

        const parsed = Number(value)
        if (Number.isNaN(parsed)) {
            throw new Error(
                `Environment variable '${key}' is not a valid number: '${value}'.\n` +
                    `Expected a numeric value like '3000' or '3.14'.`,
            )
        }
        return parsed
    },

    /**
     * Parses an environment variable as a comma-separated array of strings.
     *
     * - Splits on commas
     * - Trims whitespace from each element
     * - Filters out empty strings
     *
     * @param key - The environment variable name
     * @param defaultValue - Default value if undefined (defaults to empty array)
     * @returns The parsed array of strings
     *
     * @example
     * ```ts
     * // NEXT_PUBLIC_FEATURES=auth,payments,analytics
     * // → ['auth', 'payments', 'analytics']
     *
     * // NEXT_PUBLIC_HOSTS=localhost, 127.0.0.1, example.com
     * // → ['localhost', '127.0.0.1', 'example.com']
     *
     * // NEXT_PUBLIC_EMPTY= → []
     * // NEXT_PUBLIC_MISSING undefined → []
     *
     * const features = envParsers.array('NEXT_PUBLIC_FEATURES');
     * const hosts = envParsers.array('NEXT_PUBLIC_HOSTS', ['localhost']);
     * ```
     */
    array(key: string, defaultValue: string[] = []): string[] {
        const value = env(key)
        if (value === undefined) return defaultValue
        return value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
    },

    /**
     * Parses an environment variable as JSON.
     *
     * @param key - The environment variable name
     * @param defaultValue - Default value if undefined
     * @returns The parsed JSON value
     *
     * @throws {Error} If the value is defined but not valid JSON
     * @throws {Error} If the value is undefined and no default is provided
     *
     * @example
     * ```ts
     * // NEXT_PUBLIC_CONFIG={"api":"https://api.example.com","timeout":5000}
     *
     * interface Config {
     *   api: string;
     *   timeout: number;
     * }
     *
     * const config = envParsers.json<Config>('NEXT_PUBLIC_CONFIG');
     * const settings = envParsers.json<Settings>('NEXT_PUBLIC_SETTINGS', { theme: 'dark' });
     * ```
     */
    json<T = unknown>(key: string, defaultValue?: T): T {
        const value = env(key)
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Required environment variable '${key}' is not defined.\nExpected a JSON string value.`)
            }
            return defaultValue
        }

        try {
            return JSON.parse(value) as T
        } catch {
            throw new Error(
                `Environment variable '${key}' is not valid JSON: '${value}'.\n` +
                    `Expected a valid JSON string like '{"key":"value"}'.`,
            )
        }
    },

    /**
     * Parses an environment variable as a URL and validates it.
     *
     * @param key - The environment variable name
     * @param defaultValue - Default value if undefined
     * @returns The validated URL string
     *
     * @throws {Error} If the value is defined but not a valid URL
     * @throws {Error} If the value is undefined and no default is provided
     *
     * @example
     * ```ts
     * // NEXT_PUBLIC_API_URL=https://api.example.com/v1
     *
     * const apiUrl = envParsers.url('NEXT_PUBLIC_API_URL');
     * const cdnUrl = envParsers.url('NEXT_PUBLIC_CDN_URL', 'https://cdn.example.com');
     * ```
     */
    url(key: string, defaultValue?: string): string {
        const value = env(key)
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Required environment variable '${key}' is not defined.\nExpected a valid URL.`)
            }
            return defaultValue
        }

        try {
            new URL(value)
            return value
        } catch {
            throw new Error(
                `Environment variable '${key}' is not a valid URL: '${value}'.\n` +
                    `Expected a valid URL like 'https://example.com'.`,
            )
        }
    },

    /**
     * Parses an environment variable as one of a set of allowed values.
     *
     * Provides type-safe enum-like validation for environment variables
     * that should only contain specific string values.
     *
     * @param key - The environment variable name
     * @param allowedValues - Array of valid string values
     * @param defaultValue - Default value if undefined (must be in allowedValues)
     * @returns The validated enum value
     *
     * @throws {Error} If the value is not in the allowed values list
     * @throws {Error} If the value is undefined and no default is provided
     *
     * @example
     * ```ts
     * // NEXT_PUBLIC_ENV=production
     * type Environment = 'development' | 'staging' | 'production';
     * const appEnv = envParsers.enum<Environment>(
     *   'NEXT_PUBLIC_ENV',
     *   ['development', 'staging', 'production'],
     *   'development'
     * );
     *
     * // NEXT_PUBLIC_LOG_LEVEL=debug
     * type LogLevel = 'debug' | 'info' | 'warn' | 'error';
     * const logLevel = envParsers.enum<LogLevel>(
     *   'NEXT_PUBLIC_LOG_LEVEL',
     *   ['debug', 'info', 'warn', 'error']
     * );
     * ```
     */
    enum<T extends string>(key: string, allowedValues: readonly T[], defaultValue?: T): T {
        const value = env(key)
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(
                    `Required environment variable '${key}' is not defined.\n` +
                        `Expected one of: ${allowedValues.map((v) => `'${v}'`).join(', ')}.`,
                )
            }
            return defaultValue
        }

        if (!allowedValues.includes(value as T)) {
            throw new Error(
                `Environment variable '${key}' has invalid value: '${value}'.\n` +
                    `Expected one of: ${allowedValues.map((v) => `'${v}'`).join(', ')}.`,
            )
        }

        return value as T
    },
} as const
