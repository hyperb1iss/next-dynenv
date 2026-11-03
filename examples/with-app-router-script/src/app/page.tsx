import Link from 'next/link'

export default function Home() {
    return (
        <>
            <h1>Build once, configure at runtime</h1>
            <p>
                <code>&lt;PublicEnvScript /&gt;</code> reads every <code>NEXT_PUBLIC_*</code> variable at request time
                and writes it to <code>window.__ENV</code>, so <code>env()</code> works the same in server and client
                code.
            </p>
            <p>
                Change a value in <code>.env.local</code> and restart the server: the pages below pick it up without a
                rebuild.
            </p>
            <nav>
                <Link href="/client-side">Client component</Link>
                <Link href="/server-side">Server component</Link>
                <a href="/api/bar-baz">Route handler (JSON)</a>
            </nav>
        </>
    )
}
