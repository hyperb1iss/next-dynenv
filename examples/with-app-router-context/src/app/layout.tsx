import './globals.css'

import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicEnvProvider } from 'next-dynenv'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
    title: 'next-dynenv: context approach',
    description: 'Runtime environment variables in the Next.js App Router',
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <header>
                    <Link href="/">next-dynenv</Link>
                    <span>context approach</span>
                </header>
                <main>
                    <PublicEnvProvider>{children}</PublicEnvProvider>
                </main>
            </body>
        </html>
    )
}
