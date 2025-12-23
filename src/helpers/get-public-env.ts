import { ProcessEnv } from '../typings/process-env.js'

/**
 * Gets environment variables that start with `NEXT_PUBLIC_` prefix.
 *
 * This function filters `process.env` to only return variables that are
 * explicitly prefixed with `NEXT_PUBLIC_` (case-sensitive). These variables
 * are safe to expose to the browser.
 *
 * @returns An object containing only `NEXT_PUBLIC_*` prefixed environment variables
 *
 * @example
 * ```ts
 * // Given process.env = {
 * //   NEXT_PUBLIC_API_URL: 'https://api.example.com',
 * //   NEXT_PUBLIC_APP_NAME: 'My App',
 * //   SECRET_KEY: 'secret123'
 * // }
 *
 * const publicEnv = getPublicEnv()
 * // Returns: {
 * //   NEXT_PUBLIC_API_URL: 'https://api.example.com',
 * //   NEXT_PUBLIC_APP_NAME: 'My App'
 * // }
 * ```
 *
 * @see {@link PublicEnvScript} which uses this to inject public variables
 * @see {@link PublicEnvProvider} which uses this for React Context
 */
export function getPublicEnv(): ProcessEnv {
    const publicEnv = Object.keys(process.env)
        .filter((key) => key.startsWith('NEXT_PUBLIC_'))
        .reduce((env, key) => {
            env[key] = process.env[key]
            return env
        }, {} as ProcessEnv)

    return publicEnv
}
