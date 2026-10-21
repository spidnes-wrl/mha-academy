'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

function describeLoginError(code?: string, status?: number) {
  if (code === 'email_not_confirmed') {
    return 'Confirmez votre email avant de vous connecter (vérifiez votre boîte de réception).';
  }
  if (status === 429 || code === 'over_request_rate_limit') {
    return 'Trop de tentatives. Patientez quelques minutes puis réessayez.';
  }
  if (code === 'invalid_credentials') {
    return 'Email ou mot de passe incorrect.';
  }
  return 'Une erreur inattendue est survenue. Réessayez.';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(describeLoginError(signInError.code, signInError.status));
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutralBorder bg-neutralCard/80 p-8 shadow-xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white">Connexion</h1>
        <p className="mt-2 text-sm text-slate-400">Bienvenue sur MHA Academy</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="etudiant@academy.fr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-300">Mot de passe</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button type="submit" className="button-primary w-full disabled:opacity-60" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="font-medium text-primaryLight">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
