'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getFirebaseApp, getFirebaseAuth, getFirebaseDb } from '@/lib/firebaseClient';

export default function FirebaseDevPage() {
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const envSummary = useMemo(
    () => [
      { key: 'NEXT_PUBLIC_FB_API_KEY', present: Boolean(process.env.NEXT_PUBLIC_FB_API_KEY) },
      { key: 'NEXT_PUBLIC_FB_AUTH_DOMAIN', present: Boolean(process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN) },
      { key: 'NEXT_PUBLIC_FB_PROJECT_ID', present: Boolean(process.env.NEXT_PUBLIC_FB_PROJECT_ID) },
      { key: 'NEXT_PUBLIC_FB_STORAGE_BUCKET', present: Boolean(process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET) },
      { key: 'NEXT_PUBLIC_FB_APP_ID', present: Boolean(process.env.NEXT_PUBLIC_FB_APP_ID) },
      { key: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', present: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) },
      { key: 'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET', present: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) },
    ] as const,
    []
  );

  useEffect(() => {
    try {
      const app = getFirebaseApp();
      // Touch the primary services to ensure lazy singletons initialise without throwing.
      getFirebaseAuth();
      getFirebaseDb();

      if (app.options.projectId) {
        setStatus('connected');
      } else {
        setStatus('error');
        setError('Firebase app initialised but projectId missing.');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error initialising Firebase');
    }
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Firebase Dev Harness</h1>
        <p className="text-sm text-muted-foreground">
          Quick health-check for local Firebase credentials. Use this page after updating <code>.env.local</code> to confirm the SDK initialises without errors.
        </p>
      </header>

      <section className="glass-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Environment Variables</h2>
        <ul className="text-sm space-y-1">
          {envSummary.map(({ key, present }) => (
            <li key={key} className={present ? 'text-emerald-400' : 'text-red-400'}>
              {present ? '✓' : '✗'} {key}
            </li>
          ))}
        </ul>
      </section>

      <section className="glass-card p-4 space-y-2">
        <h2 className="text-lg font-semibold">Connection Status</h2>
        {status === 'idle' && <p className="text-sm text-muted-foreground">Initialising Firebase…</p>}
        {status === 'connected' && (
          <p className="text-sm text-emerald-400">
            Firebase app initialised successfully. Auth and Firestore SDKs are ready. Images stored in Cloudinary.
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-400">
            Failed to initialise Firebase. {error}
          </p>
        )}
      </section>

      <section className="glass-card p-4 space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Next Steps</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Confirm all env vars show as present above.</li>
          <li>If status reports an error, revisit the Firebase console and copy config values again.</li>
          <li>Once connected, swap <code>NEXT_PUBLIC_DATA_SOURCE</code> to <code>firebase</code> to opt-in adapters (after they land).</li>
        </ol>
      </section>
    </main>
  );
}
