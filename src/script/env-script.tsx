import { headers } from 'next/headers'
import Script, { type ScriptProps } from 'next/script'
import { type FC } from 'react'

import { escapeJsonForHtml } from '../helpers/escape-json-for-html'
import { type NonceConfig } from '../typings/nonce'
import { type ProcessEnv } from '../typings/process-env'
import { PUBLIC_ENV_KEY } from './constants'

/**
 * Props for the {@link EnvScript} component.
 */
type EnvScriptProps = {
    /**
     * Environment variables object to inject into the browser.
     *
     * This object will be serialized and attached to the window object,
     * making the variables accessible to client-side code.
     *
     * @example
     * ```tsx
     * const env = {
     *   NEXT_PUBLIC_API_URL: 'https://api.example.com',
     *   NEXT_PUBLIC_APP_NAME: 'My App',
     * };
     * <EnvScript env={env} />
     * ```
     */
    env: ProcessEnv

    /**
     * Content Security Policy nonce to apply to the script tag.
     *
     * Can be a string value directly, or a NonceConfig object that specifies
     * a header key to read the nonce from at runtime.
     *
     * **Note:** NonceConfig object support is currently blocked by Next.js PR #58129.
     *
     * @example
     * ```tsx
     * // Direct nonce string
     * <EnvScript env={env} nonce="random-nonce-value" />
     * ```
     */
    nonce?: string | NonceConfig

    /**
     * Whether to use a regular `<script>` tag instead of Next.js' `<Script>` component.
     *
     * Set to `true` when using tools like Sentry where the Next.js Script component's
     * timing causes initialization issues, even with `strategy: "beforeInteractive"`.
     *
     * When `true`, renders a standard HTML script tag. When `false`, uses Next.js'
     * optimized Script component.
     *
     * @default false
     * @example
     * ```tsx
     * <EnvScript env={env} disableNextScript={true} />
     * ```
     */
    disableNextScript?: boolean

    /**
     * Additional props to pass to Next.js' `<Script>` component.
     *
     * Only used when `disableNextScript` is `false`. Allows customization of
     * script loading behavior through Next.js Script component props.
     *
     * @default { strategy: 'beforeInteractive' }
     * @see https://nextjs.org/docs/app/api-reference/components/script
     * @example
     * ```tsx
     * <EnvScript
     *   env={env}
     *   nextScriptProps={{
     *     strategy: 'afterInteractive',
     *     onLoad: () => console.log('Env loaded')
     *   }}
     * />
     * ```
     */
    nextScriptProps?: ScriptProps
}

/**
 * Low-level component that injects custom environment variables into the browser.
 *
 * This component serializes the provided environment object and injects it into
 * the browser via a script tag. Unlike {@link PublicEnvScript}, this component
 * accepts custom environment variables rather than automatically reading from
 * `process.env`.
 *
 * The environment object is attached to the window object and can be accessed
 * using the {@link env} function on the client side.
 *
 * @param props - Component configuration including the env object to inject
 * @returns A script tag (Next.js Script or HTML script) that sets the environment
 *
 * @example
 * Basic usage with custom environment:
 * ```tsx
 * import { EnvScript } from '@hyperb1iss/next-runtime-env';
 *
 * export default function Layout() {
 *   const customEnv = {
 *     NEXT_PUBLIC_API_URL: process.env.API_URL,
 *     NEXT_PUBLIC_FEATURE_FLAG: process.env.FEATURE_FLAG,
 *   };
 *
 *   return (
 *     <html>
 *       <head>
 *         <EnvScript env={customEnv} />
 *       </head>
 *       <body>...</body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example
 * With CSP nonce for security:
 * ```tsx
 * <head>
 *   <EnvScript env={env} nonce="random-nonce-123" />
 * </head>
 * ```
 *
 * @example
 * Using regular script tag (bypasses Next.js Script):
 * ```tsx
 * <head>
 *   <EnvScript env={env} disableNextScript={true} />
 * </head>
 * ```
 *
 * @see {@link PublicEnvScript} for automatic NEXT_PUBLIC_* variable injection
 */
export const EnvScript: FC<EnvScriptProps> = async ({
    env,
    nonce,
    disableNextScript = false,
    nextScriptProps = { strategy: 'beforeInteractive' },
}) => {
    let nonceString: string | undefined
    if (typeof nonce === 'object' && nonce !== null) {
        try {
            // Next.js 16+ requires async headers() call
            const headerStore = await headers()

            if (headerStore && typeof headerStore.get === 'function') {
                nonceString = headerStore.get(nonce.headerKey) ?? undefined
            }
        } catch (error) {
            // Handle cases where headers() is called outside a request scope
            // (e.g., during static generation, CLI scripts, or tests)
            const isOutsideRequestScope =
                error instanceof Error &&
                (error.message.includes('outside a request scope') ||
                    error.message.includes('was called outside a request scope') ||
                    error.message.includes('Dynamic server usage'))

            if (!isOutsideRequestScope) {
                throw error
            }
            nonceString = undefined
        }
    } else if (typeof nonce === 'string') {
        nonceString = nonce
    }

    // Security: Escape JSON to prevent XSS via script injection, and freeze to prevent tampering
    const innerHTML = {
        __html: `window['${PUBLIC_ENV_KEY}'] = Object.freeze(${escapeJsonForHtml(env)})`,
    }

    // You can opt to use a regular "<script>" tag instead of Next.js' Script Component.
    // Note: When using Sentry, sentry.client.config.ts might run after the Next.js <Script> component, even when the strategy is "beforeInteractive"
    // This results in the runtime environments being undefined and the Sentry client config initialized without the correct configuration.
    if (disableNextScript) {
        return <script dangerouslySetInnerHTML={innerHTML} nonce={nonceString} />
    }

    // Use Next.js Script Component by default
    return <Script {...nextScriptProps} dangerouslySetInnerHTML={innerHTML} nonce={nonceString} />
}
