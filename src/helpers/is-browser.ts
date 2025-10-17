import { PUBLIC_ENV_KEY } from '../script/constants'

/**
 * Checks if the code is running in the browser.
 */
export function isBrowser() {
    return Boolean(typeof window !== 'undefined' && window[PUBLIC_ENV_KEY])
}
