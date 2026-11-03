import { makeEnvPublic } from 'next-dynenv'

export function register() {
    // Expose BAZ to the browser as NEXT_PUBLIC_BAZ without renaming it
    makeEnvPublic('BAZ')
}
