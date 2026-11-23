import { Suspense } from 'react';
import MessagesClient from '@/components/MessagesClient';

export default function MessagesPage() {
  return <Suspense fallback={<main className="mx-auto max-w-3xl p-6 text-sm text-neutral-400">Chargement des messages…</main>}><MessagesClient /></Suspense>;
}
