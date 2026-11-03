import { type ScriptProps } from 'next/script.js'
import { connection } from 'next/server.js'
import { type FC } from 'react'

import { getPublicEnv } from '../helpers/get-public-env.js'
import { type NonceConfig } from '../typings/nonce.js'
import { EnvScript } from './env-script.js'

/**
 * Props for the {@link PublicEnvScript} component.
 */
type PublicEnvScriptProps = {
    /**
     * Content Security Policy nonce to apply to the script tag.
     *
     * Can be a string value directly, or a NonceConfig object that specifies
     * a header key to read the nonce from at runtime.
     *
     * @example
     * ```tsx
     * // Direct nonce string
     * <PublicEnvScript nonce="random-nonce-value" />
     *
     * // Nonce read from a request header set in proxy.ts
     * <PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
     * ```
     */
    nonce?: string | NonceConfig

    /**
     * Whether to use a regular `<script>` tag instead of Next.js' `<Script>` component.
     *
     * Set to `true` when code in `instrumentation-client.ts` (for example a Sentry
     * init) reads the environment: Next.js runs that file before `beforeInteractive`
     * scripts, while a plain inline script runs as soon as the HTML is parsed.
     *
     * Next.js only adds its CSP nonce to its own `<Script>`, so pass `nonce`
     * explicitly when this is `true` and a CSP is in place.
     *
     * @default false
     * @example
     * ```tsx
     * <PublicEnvScript disableNextScript={true} />
     * ```
     */
    disableNextScript?: boolean

    /**
     * Additional props to pass to Next.js' `<Script>` component.
     *
     * Only used when `disableNextScript` is `false`.
     * Keep the default `beforeInteractive` strategy: with a later strategy, client
     * components hydrate before `window.__ENV` exists and read `undefined`.
     *
     * @default { strategy: 'beforeInteractive' }
     * @see https://nextjs.org/docs/app/api-reference/components/script
     * @example
     * ```tsx
     * <PublicEnvScript nextScriptProps={{ id: 'runtime-env' }} />
     * ```
     */
    nextScriptProps?: ScriptProps
}

/**
 * Server component that injects public environment variables into the browser.
 *
 * This component automatically reads all `NEXT_PUBLIC_*` environment variables
 * at runtime and makes them available in the browser via a global object. It
 * opts into Next.js dynamic rendering to ensure variables are always fresh.
 *
 * **Important:** This is an async server component that uses Next.js 15's
 * `connection()` API to disable static optimization. It must be placed in
 * server-rendered contexts.
 *
 * @param props - Component configuration options
 * @returns A script tag that initializes the public environment in the browser
 *
 * @example
 * Basic usage in app layout:
 * ```tsx
 * // app/layout.tsx
 * import { PublicEnvScript } from 'next-dynenv';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <PublicEnvScript />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example
 * With CSP nonce:
 * ```tsx
 * <head>
 *   <PublicEnvScript nonce="your-csp-nonce" />
 * </head>
 * ```
 *
 * @example
 * Using regular script tag (for Sentry compatibility):
 * ```tsx
 * <head>
 *   <PublicEnvScript disableNextScript={true} />
 * </head>
 * ```
 *
 * @see {@link EnvScript} for the underlying implementation
 * @see {@link PublicEnvProvider} for the React Context alternative
 */
export const PublicEnvScript: FC<PublicEnvScriptProps> = async ({ nonce, disableNextScript, nextScriptProps }) => {
    // Opt into dynamic rendering (Next.js 15+)
    await connection()

    // This value will be evaluated at runtime
    const publicEnv = getPublicEnv()

    return (
        <EnvScript
            disableNextScript={disableNextScript}
            env={publicEnv}
            nextScriptProps={nextScriptProps}
            nonce={nonce}
        />
    )
}
