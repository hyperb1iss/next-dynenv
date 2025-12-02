'use client'

import { useContext } from 'react'

import { EnvContext } from './env-context'

/**
 * React hook for accessing environment variables from the nearest EnvProvider.
 *
 * This hook retrieves environment variables that were provided by either
 * {@link PublicEnvProvider} or {@link EnvProvider}. It must be called within
 * a component that is a descendant of one of these providers.
 *
 * **Note:** This is a client-side hook (requires `'use client'` directive) and
 * can only be used in client components.
 *
 * @returns Environment variables object containing all provided variables
 *
 * @throws {Error} When called outside of an EnvProvider or PublicEnvProvider.
 * Error message: "useEnvContext must be used within a EnvProvider or PublicEnvProvider"
 *
 * @example
 * Basic usage in a client component:
 * ```tsx
 * 'use client';
 * import { useEnvContext } from 'next-dynenv';
 *
 * export function ApiClient() {
 *   const env = useEnvContext();
 *   const apiUrl = env.NEXT_PUBLIC_API_URL;
 *
 *   return <div>Connecting to {apiUrl}</div>;
 * }
 * ```
 *
 * @example
 * Destructuring specific variables:
 * ```tsx
 * 'use client';
 * import { useEnvContext } from 'next-dynenv';
 *
 * export function FeatureFlag() {
 *   const { NEXT_PUBLIC_FEATURE_X, NEXT_PUBLIC_FEATURE_Y } = useEnvContext();
 *
 *   return (
 *     <div>
 *       <p>Feature X: {NEXT_PUBLIC_FEATURE_X ? 'Enabled' : 'Disabled'}</p>
 *       <p>Feature Y: {NEXT_PUBLIC_FEATURE_Y ? 'Enabled' : 'Disabled'}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * With error handling:
 * ```tsx
 * 'use client';
 * import { useEnvContext } from 'next-dynenv';
 *
 * export function SafeComponent() {
 *   try {
 *     const env = useEnvContext();
 *     return <div>API: {env.NEXT_PUBLIC_API_URL}</div>;
 *   } catch (error) {
 *     return <div>Error: Component must be wrapped in PublicEnvProvider</div>;
 *   }
 * }
 * ```
 *
 * @example
 * Using with default values:
 * ```tsx
 * 'use client';
 * import { useEnvContext } from 'next-dynenv';
 *
 * export function ConfigurableComponent() {
 *   const env = useEnvContext();
 *   const apiUrl = env.NEXT_PUBLIC_API_URL ?? 'https://default-api.com';
 *   const timeout = Number(env.NEXT_PUBLIC_TIMEOUT ?? '5000');
 *
 *   return <div>API URL: {apiUrl} (timeout: {timeout}ms)</div>;
 * }
 * ```
 *
 * @see {@link PublicEnvProvider} for automatic public variable injection
 * @see {@link EnvProvider} for custom environment injection
 * @see {@link env} for direct function-based access (works on server and client)
 */
export const useEnvContext = () => {
    const context = useContext(EnvContext)

    if (!context) {
        throw new Error('useEnvContext must be used within a EnvProvider or PublicEnvProvider')
    }

    return context
}
