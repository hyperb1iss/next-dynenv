import ClientContextReader from './client-context-reader'

export default function ContextPage() {
    return (
        <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Context Provider Mode Test</h1>
            <ClientContextReader />
        </main>
    )
}
