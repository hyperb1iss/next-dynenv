import { PublicEnvProvider } from 'next-runtime-env';

export default function ContextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicEnvProvider>{children}</PublicEnvProvider>;
}
