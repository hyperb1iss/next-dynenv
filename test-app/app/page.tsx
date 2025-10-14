import React from 'react';
import { env } from 'next-runtime-env';

export default function HomePage() {
  const serverValue = env('NEXT_PUBLIC_TEST_VAR');

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Next Runtime Env - Integration Test</h1>

      <section>
        <h2>Server-side env()</h2>
        <p>Server rendered value: <strong data-testid="server-value">{serverValue || 'undefined'}</strong></p>
      </section>

      <section>
        <h2>Client-side window.__ENV</h2>
        <ClientEnvReader />
      </section>
    </main>
  );
}

function ClientEnvReader() {
  'use client';

  const [clientValue, setClientValue] = React.useState<string>('loading...');

  React.useEffect(() => {
    const value = (window as any).__ENV?.NEXT_PUBLIC_TEST_VAR || 'undefined';
    setClientValue(value);
  }, []);

  return (
    <p>Client rendered value: <strong data-testid="client-value">{clientValue}</strong></p>
  );
}
