import { headers } from 'next/headers';

import { isBrowser } from '../helpers/is-browser';
import { PUBLIC_ENV_KEY } from './constants';

/**
 * Reads a safe environment variable from the browser or any environment
 * variable from the server (process.env).
 *
 * Usage:
 * ```ts
 * const API_URL = env('NEXT_PUBLIC_API_URL');
 * ```
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
