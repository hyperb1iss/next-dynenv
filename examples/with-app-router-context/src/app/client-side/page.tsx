'use client'

import { useEnvContext } from 'next-dynenv'

export default function ClientSide() {
    const { NEXT_PUBLIC_FOO, NEXT_PUBLIC_BAZ } = useEnvContext()

    return (
        <>
            <h1>Client component</h1>
            <p>
                <code>useEnvContext()</code> returns the public variables passed down by{' '}
                <code>&lt;PublicEnvProvider&gt;</code>.
            </p>
            <dl>
                <dt>NEXT_PUBLIC_FOO</dt>
                <dd>{NEXT_PUBLIC_FOO ?? 'unset'}</dd>
                <dt>NEXT_PUBLIC_BAZ</dt>
                <dd>{NEXT_PUBLIC_BAZ ?? 'unset'}</dd>
            </dl>
        </>
    )
}
