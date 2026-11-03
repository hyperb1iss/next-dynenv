'use client'

import { env } from 'next-dynenv'

export default function ClientSide() {
    return (
        <>
            <h1>Client component</h1>
            <p>
                <code>env()</code> reads from <code>window.__ENV</code> in the browser. Only <code>NEXT_PUBLIC_*</code>{' '}
                keys are allowed there.
            </p>
            <dl>
                <dt>NEXT_PUBLIC_FOO</dt>
                <dd>{env('NEXT_PUBLIC_FOO') ?? 'unset'}</dd>
                <dt>NEXT_PUBLIC_BAZ</dt>
                <dd>{env('NEXT_PUBLIC_BAZ') ?? 'unset'}</dd>
            </dl>
        </>
    )
}
