'use client'

import { useEffect, useState } from 'react'

export function ClientEnvReader() {
    const [clientValue, setClientValue] = useState('loading...')

    useEffect(() => {
        const value = (window as { __ENV?: Record<string, string | undefined> }).__ENV?.NEXT_PUBLIC_TEST_VAR
        setClientValue(value ?? 'undefined')
    }, [])

    return (
        <p>
            Client rendered value: <strong data-testid="client-value">{clientValue}</strong>
        </p>
    )
}

export default ClientEnvReader
