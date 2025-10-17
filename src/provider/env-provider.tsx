'use client';

import { type FC, type PropsWithChildren } from 'react';

import { type ProcessEnv } from '../typings/process-env';
import { EnvContext } from './env-context';

/**
 * Props for the {@link EnvProvider} component.
 */
type EnvProviderProps = PropsWithChildren<{
  /**
   * Custom environment variables object to provide to child components.
   *
   * This object will be made available through the {@link useEnvContext} hook
   * to all descendant components.
   *
   * @example
   * ```tsx
   * const customEnv = {
   *   NEXT_PUBLIC_API_URL: process.env.API_URL,
   *   NEXT_PUBLIC_APP_NAME: 'My App',
   * };
   * <EnvProvider env={customEnv}>
   *   <App />
   * </EnvProvider>
   * ```
   */
  env: ProcessEnv;
}>;

/**
 * Client component that provides custom environment variables via React Context.
 *
 * This is a low-level component that accepts a custom environment object and makes
 * it available to child components through the {@link useEnvContext} hook. Unlike
 * {@link PublicEnvProvider}, this component requires you to explicitly pass the
 * environment object.
 *
 * **Note:** This is a client component (uses `'use client'` directive) and is
 * typically wrapped by server components like {@link PublicEnvProvider} that
 * prepare the environment data.
 *
 * Most users should use {@link PublicEnvProvider} instead, which automatically
 * handles reading public environment variables. Use `EnvProvider` when you need
 * fine-grained control over which variables to expose.
 *
 * @param props - Component props including the env object and children
 * @returns A React Context provider wrapping the children
 *
 * @example
 * Basic usage with custom environment:
 * ```tsx
 * 'use client';
 * import { EnvProvider } from '@hyperb1iss/next-runtime-env';
 *
 * export function CustomProvider({ children }) {
 *   const env = {
 *     NEXT_PUBLIC_API_URL: 'https://api.example.com',
 *     NEXT_PUBLIC_FEATURE_X: 'enabled',
 *   };
 *
 *   return <EnvProvider env={env}>{children}</EnvProvider>;
 * }
 * ```
 *
 * @example
 * Used by server component (typical pattern):
 * ```tsx
 * // Server component
 * export async function ServerWrapper({ children }) {
 *   const customEnv = await fetchCustomEnv();
 *   return <EnvProvider env={customEnv}>{children}</EnvProvider>;
 * }
 * ```
 *
 * @example
 * Accessing provided values:
 * ```tsx
 * 'use client';
 * import { useEnvContext } from '@hyperb1iss/next-runtime-env';
 *
 * export function MyComponent() {
 *   const { NEXT_PUBLIC_API_URL } = useEnvContext();
 *   return <div>API: {NEXT_PUBLIC_API_URL}</div>;
 * }
 * ```
 *
 * @see {@link PublicEnvProvider} for automatic public variable injection
 * @see {@link useEnvContext} for consuming the provided environment
 */
export const EnvProvider: FC<EnvProviderProps> = ({ children, env }) => {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
};
