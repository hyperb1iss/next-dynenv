'use client'

import { useEnvContext } from 'next-dynenv'

export function ClientContextReader() {
    const env = useEnvContext()
    const value = env.NEXT_PUBLIC_TEST_VAR ?? 'undefined'

    return (
        <section>
            <h2>Using useEnvContext() hook</h2>
            <p>
                Context value: <strong data-testid="context-value">{value}</strong>
            </p>
        </section>
    )
}

export default ClientContextReader
