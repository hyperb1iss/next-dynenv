import React from 'react';

export default function ContextPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Context Provider Mode Test</h1>
      <ClientContextReader />
    </main>
  );
}

function ClientContextReader() {
  'use client';

  const { useEnv } = require('@hyperb1iss/next-runtime-env');
  const value = useEnv('NEXT_PUBLIC_TEST_VAR');

  return (
    <section>
      <h2>Using useEnv() hook</h2>
      <p>Context value: <strong data-testid="context-value">{value || 'undefined'}</strong></p>
    </section>
  );
}
