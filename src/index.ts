/* istanbul ignore file */

// This allows TypeScript to detect our global value.
declare global {
    interface Window {
        __ENV: NodeJS.ProcessEnv
    }
}

export * from './provider/index.js'
export * from './script/index.js'
export { makeEnvPublic } from './utils/make-env-public.js'
