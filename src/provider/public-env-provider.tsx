import { connection } from 'next/server'
import { type FC, type PropsWithChildren } from 'react'

import { getPublicEnv } from '../helpers/get-public-env'
import { EnvProvider } from './env-provider'

/**
 * Props for the {@link PublicEnvProvider} component.
 */
type PublicEnvProviderProps = PropsWithChildren

/**
 * Server component that provides public environment variables via React Context.
 *
 * This async component automatically reads all `NEXT_PUBLIC_*` environment variables
 * at runtime and makes them available to client components through the {@link useEnvContext}
 * hook. It opts into Next.js dynamic rendering to ensure variables are always fresh.
 *
 * **Important:** This is an async server component that uses Next.js 15's `connection()`
 * API to disable static optimization. It must be used in server-rendered contexts and
 * wraps client components that need environment access.
 *
 * This is an alternative to {@link PublicEnvScript} that uses React Context instead of
 * a global window object. Choose based on your architecture:
 * - Use `PublicEnvScript` for direct window object access
 * - Use `PublicEnvProvider` for React Context-based access
 *
 * @param props - Component props including children to wrap
 * @returns A React Context provider with public environment variables
 *
 * @example
 * Basic usage in app layout:
 * ```tsx
 * // app/layout.tsx
 * import { PublicEnvProvider } from '@hyperb1iss/next-runtime-env';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PublicEnvProvider>
 *           {children}
 *         </PublicEnvProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example
 * Accessing values in client components:
 * ```tsx
 * 'use client';
 * import { useEnvContext } from '@hyperb1iss/next-runtime-env';
 *
 * export function MyComponent() {
 *   const env = useEnvContext();
 *   return <div>API URL: {env.NEXT_PUBLIC_API_URL}</div>;
 * }
 * ```
 *
 * @example
 * Combining with other providers:
 * ```tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <PublicEnvProvider>
 *       <ThemeProvider>
 *         <AuthProvider>
 *           {children}
 *         </AuthProvider>
 *       </ThemeProvider>
 *     </PublicEnvProvider>
 *   );
 * }
 * ```
 *
 * @see {@link useEnvContext} for accessing the environment in client components
 * @see {@link PublicEnvScript} for the window object-based alternative
 * @see {@link EnvProvider} for custom environment injection
 */
export const PublicEnvProvider: FC<PublicEnvProviderProps> = async ({ children }) => {
    // Opt into dynamic rendering (Next.js 15+)
    await connection()

    // This value will be evaluated at runtime
    const publicEnv = getPublicEnv()

    return <EnvProvider env={publicEnv}>{children}</EnvProvider>
}
