import './globals.css'

import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicEnvScript } from 'next-dynenv'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
    title: 'next-dynenv: script approach',
    description: 'Runtime environment variables in the Next.js App Router',
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                {/* x-nonce is set per request by src/proxy.ts */}
                <PublicEnvScript nonce={{ headerKey: 'x-nonce' }} />
            </head>
            <body>
                <header>
                    <Link href="/">next-dynenv</Link>
                    <span>script approach</span>
                </header>
                <main>{children}</main>
            </body>
        </html>
    )
}
