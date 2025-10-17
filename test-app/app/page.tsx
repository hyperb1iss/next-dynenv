import { env } from '@hyperb1iss/next-runtime-env'

import ClientEnvReader from './client-env-reader'

export default function HomePage() {
    const serverValue = env('NEXT_PUBLIC_TEST_VAR')

    return (
        <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Next Runtime Env - Integration Test</h1>

            <section>
                <h2>Server-side env()</h2>
                <p>
                    Server rendered value: <strong data-testid="server-value">{serverValue || 'undefined'}</strong>
                </p>
            </section>

            <section>
                <h2>Client-side window.__ENV</h2>
                <ClientEnvReader />
            </section>
        </main>
    )
}
