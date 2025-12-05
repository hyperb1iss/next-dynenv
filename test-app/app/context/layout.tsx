import { PublicEnvProvider } from 'next-dynenv'

export default function ContextLayout({ children }: { children: React.ReactNode }) {
    return <PublicEnvProvider>{children}</PublicEnvProvider>
}
