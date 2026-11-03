import { connection } from 'next/server'
import { env } from 'next-dynenv'

export default async function ServerSide() {
    // Render per request so the values below come from the running server
    await connection()

    return (
        <>
            <h1>Server component</h1>
            <p>
                Server components can read any variable, public or not. <code>BAZ</code> is also exposed to the browser
                as <code>NEXT_PUBLIC_BAZ</code> by <code>makeEnvPublic</code> in <code>instrumentation.ts</code>.
            </p>
            <dl>
                <dt>BAR</dt>
                <dd>{env('BAR') ?? 'unset'}</dd>
                <dt>BAZ</dt>
                <dd>{env('BAZ') ?? 'unset'}</dd>
            </dl>
        </>
    )
}
