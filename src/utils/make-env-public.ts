import { event, LogOptions, warn } from '../helpers/log';

/**
 * Options for controlling the logging behavior of {@link makeEnvPublic}.
 */
export type MakeEnvPublicOptions = LogOptions;

/**
 * Internal helper function that adds NEXT_PUBLIC_ prefix to a single environment variable.
 *
 * @internal
 * @param key - Environment variable name to prefix
 * @param options - Logging configuration options
 */
function prefixKey(key: string, options?: MakeEnvPublicOptions) {
  // Check if key is available in process.env.
  if (!process.env[key]) {
    warn(
      `Skipped prefixing environment variable '${key}'. Variable not in process.env`,
      options,
    );

    return;
  }

  // Check if key is already public.
  if (/^NEXT_PUBLIC_/i.test(key)) {
    warn(`Environment variable '${key}' is already public`, options);
  }

  const prefixedKey = `NEXT_PUBLIC_${key}`;

  process.env[prefixedKey] = process.env[key];

  event(`Prefixed environment variable '${key}'`, options);
}

/**
 * Makes private environment variables public by adding the NEXT_PUBLIC_ prefix.
 *
 * This utility function copies environment variables from `process.env` to new
 * `NEXT_PUBLIC_` prefixed versions, making them accessible in the browser when
 * used with Next.js' built-in environment variable handling.
 *
 * **Important:** This function modifies `process.env` and should be called early
 * in your application lifecycle, typically in `next.config.js` or an initialization
 * script that runs before your app starts.
 *
 * **Behavior:**
 * - Skips variables that don't exist in `process.env` (logs a warning)
 * - Skips variables already prefixed with `NEXT_PUBLIC_` (logs a warning)
 * - Creates a new prefixed copy without removing the original variable
 * - Logs events when successfully prefixing variables (configurable)
 *
 * @param key - Single environment variable name or array of names to make public
 * @param options - Logging configuration options
 * @param options.logLevel - Controls logging verbosity: 'info' (default), 'silent', etc.
 *
 * @example
 * Making a single variable public:
 * ```ts
 * // next.config.js or instrumentation.ts
 * import { makeEnvPublic } from '@hyperb1iss/next-runtime-env';
 *
 * // Make API_URL available as NEXT_PUBLIC_API_URL
 * makeEnvPublic('API_URL');
 * ```
 *
 * @example
 * Making multiple variables public:
 * ```ts
 * import { makeEnvPublic } from '@hyperb1iss/next-runtime-env';
 *
 * makeEnvPublic(['API_URL', 'APP_NAME', 'FEATURE_FLAG']);
 * // Creates: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_FEATURE_FLAG
 * ```
 *
 * @example
 * Controlling log output:
 * ```ts
 * import { makeEnvPublic } from '@hyperb1iss/next-runtime-env';
 *
 * // Disable all logging
 * makeEnvPublic('API_URL', { logLevel: 'silent' });
 *
 * // Only log in development
 * makeEnvPublic('API_URL', {
 *   logLevel: process.env.NODE_ENV === 'production' ? 'silent' : 'info'
 * });
 * ```
 *
 * @example
 * Using in next.config.js:
 * ```js
 * // next.config.js
 * const { makeEnvPublic } = require('@hyperb1iss/next-runtime-env');
 *
 * // Make variables public before Next.js processes them
 * makeEnvPublic(['DATABASE_URL', 'API_KEY']);
 *
 * module.exports = {
 *   // ... your Next.js config
 * };
 * ```
 *
 * @example
 * Handling missing variables gracefully:
 * ```ts
 * // These will log warnings but won't throw errors
 * makeEnvPublic(['EXISTING_VAR', 'MISSING_VAR', 'ANOTHER_EXISTING_VAR']);
 * // Warning: "Skipped prefixing environment variable 'MISSING_VAR'.
 * //          Variable not in process.env"
 * ```
 *
 * @see {@link PublicEnvScript} for injecting public variables into the browser
 * @see {@link env} for accessing variables at runtime
 */
export function makeEnvPublic(
  key: string | string[],
  options?: MakeEnvPublicOptions,
): void {
  if (typeof key === 'string') {
    prefixKey(key, options);
  } else {
    key.forEach((value) => prefixKey(value, options));
  }
}
