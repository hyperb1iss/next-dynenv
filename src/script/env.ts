import { headers } from 'next/headers';

import { isBrowser } from '../helpers/is-browser';
import { PUBLIC_ENV_KEY } from './constants';

/**
 * Reads environment variables safely from both browser and server contexts.
 *
 * This function provides a unified interface for accessing environment variables
 * across client and server boundaries with built-in safety checks:
 *
 * - **Server-side**: Returns any variable from `process.env` and opts into dynamic
 *   rendering by calling `headers()` to prevent static optimization.
 * - **Client-side**: Only allows access to `NEXT_PUBLIC_*` prefixed variables that
 *   were injected via {@link PublicEnvScript} or {@link EnvScript}.
 *
 * @param key - The environment variable name to retrieve
 * @returns The environment variable value, or `undefined` if not found
 *
 * @throws {Error} When called in the browser with a non-public variable name
 * (i.e., a key that doesn't start with `NEXT_PUBLIC_`)
 *
 * @example
 * Reading public variables (works on both client and server):
 * ```ts
 * import { env } from '@hyperb1iss/next-runtime-env';
 *
 * const apiUrl = env('NEXT_PUBLIC_API_URL');
 * const appName = env('NEXT_PUBLIC_APP_NAME');
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
 * @example
 * Handling undefined values:
 * ```ts
 * const apiUrl = env('NEXT_PUBLIC_API_URL') ?? 'https://default-api.com';
 *
 * if (!env('NEXT_PUBLIC_FEATURE_FLAG')) {
 *   console.log('Feature disabled');
 * }
 * ```
 *
 * @see {@link PublicEnvScript} to inject public variables into the browser
 * @see {@link useEnvContext} for React hook-based access in client components
 */
export function env(key: string): string | undefined {
  if (isBrowser()) {
    if (!key.startsWith('NEXT_PUBLIC_')) {
      throw new Error(
        `Environment variable '${key}' is not public and cannot be accessed in the browser.`,
      );
    }

    return window[PUBLIC_ENV_KEY][key];
  }

  // Force dynamic rendering by accessing headers (Next.js 15+)
  // This replaces the deprecated unstable_noStore() call
  headers();

  return process.env[key];
}
