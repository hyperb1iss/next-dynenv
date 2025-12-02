import { isBrowser } from '../helpers/is-browser'
import { PUBLIC_ENV_KEY } from './constants'

/**
 * Reads environment variables safely from both browser and server contexts.
 *
 * This function provides a unified interface for accessing environment variables
 * across client and server boundaries with built-in safety checks:
 *
 * - **Server-side**: Returns any variable from `process.env`. For runtime evaluation
 *   (dynamic rendering), use this within components wrapped by {@link PublicEnvScript}
 *   or {@link PublicEnvProvider}, which handle dynamic rendering via `connection()`.
 * - **Client-side**: Only allows access to `NEXT_PUBLIC_*` prefixed variables that
 *   were injected via {@link PublicEnvScript} or {@link EnvScript}.
 *
 * **Note on Dynamic Rendering:** This function reads from `process.env` synchronously.
 * To ensure environment variables are evaluated at runtime (not build time), wrap your
 * layout with {@link PublicEnvScript} or {@link PublicEnvProvider}. These components
 * use Next.js's `connection()` API to opt into dynamic rendering.
 *
 * @param key - The environment variable name to retrieve
 * @param defaultValue - Optional default value if the variable is undefined
 * @returns The environment variable value, the default value, or `undefined` if neither exists
 *
 * @throws {Error} When called in the browser with a non-public variable name
 * (i.e., a key that doesn't start with `NEXT_PUBLIC_`)
 *
 * @example
 * Reading public variables (works on both client and server):
 * ```ts
 * import { env } from 'next-dynenv';
 *
 * const apiUrl = env('NEXT_PUBLIC_API_URL');
 * const appName = env('NEXT_PUBLIC_APP_NAME');
 * ```
 *
 * @example
 * Using default values:
 * ```ts
 * // Returns the default if NEXT_PUBLIC_API_URL is undefined
 * const apiUrl = env('NEXT_PUBLIC_API_URL', 'https://default-api.com');
 *
 * // Default value is type-safe
 * const timeout = env('NEXT_PUBLIC_TIMEOUT', '5000');
 * ```
 *
 * @example
 * Reading server-only variables (only works on server):
 * ```ts
 * // This works in server components or API routes
 * const dbPassword = env('DATABASE_PASSWORD');
 * const apiSecret = env('API_SECRET');
 *
 * // This throws an error in browser:
 * // Error: Environment variable 'DATABASE_PASSWORD' is not public
 * // and cannot be accessed in the browser.
 * ```
 *
 * @see {@link PublicEnvScript} to inject public variables into the browser
 * @see {@link PublicEnvProvider} for React Context-based access
 * @see {@link useEnvContext} for React hook-based access in client components
 * @see {@link requireEnv} for required variables that throw if undefined
 */
export function env(key: string): string | undefined
export function env<T extends string>(key: string, defaultValue: T): string
export function env(key: string, defaultValue?: string): string | undefined {
    if (isBrowser()) {
        if (!key.startsWith('NEXT_PUBLIC_')) {
            throw new Error(
                `Environment variable '${key}' is not public and cannot be accessed in the browser.\n` +
                    'To fix this:\n' +
                    `  1. Rename to 'NEXT_PUBLIC_${key}' if it should be public, or\n` +
                    `  2. Use makeEnvPublic('${key}') in next.config.js, or\n` +
                    '  3. Access from a server component or API route instead',
            )
        }

        return window[PUBLIC_ENV_KEY][key] ?? defaultValue
    }

    return process.env[key] ?? defaultValue
}

/**
 * Gets a required environment variable or throws if undefined.
 *
 * Use this for environment variables that must be defined for your application
 * to function correctly. It provides a clear error message at the point of use
 * rather than cryptic failures later.
 *
 * @param key - The environment variable name to retrieve
 * @returns The environment variable value (guaranteed to be defined)
 *
 * @throws {Error} When the environment variable is undefined
 * @throws {Error} When called in the browser with a non-public variable name
 *
 * @example
 * ```ts
 * import { requireEnv } from 'next-dynenv';
 *
 * // Throws immediately if NEXT_PUBLIC_API_URL is not defined
 * const apiUrl = requireEnv('NEXT_PUBLIC_API_URL');
 *
 * // Type is `string`, not `string | undefined`
 * console.log(apiUrl.toUpperCase());
 * ```
 *
 * @example
 * Server-side required variables:
 * ```ts
 * // In a server component or API route
 * const dbUrl = requireEnv('DATABASE_URL');
 * const apiKey = requireEnv('API_SECRET_KEY');
 * ```
 *
 * @see {@link env} for optional variables with default values
 */
export function requireEnv(key: string): string {
    const value = env(key)
    if (value === undefined) {
        throw new Error(
            `Required environment variable '${key}' is not defined.\n` +
                'Please set it in your environment or .env file.',
        )
    }
    return value
}
