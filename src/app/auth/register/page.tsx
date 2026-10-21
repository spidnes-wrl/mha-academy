'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

function describeSignUpError(code?: string, status?: number) {
  if (code === 'weak_password') {
    return 'Mot de passe trop faible (6 caractères minimum).';
  }
  if (code === 'email_address_invalid') {
    return 'Adresse email invalide.';
  }
  if (status === 429 || code === 'over_email_send_rate_limit') {
    return "Trop d'inscriptions récentes. Patientez quelques minutes puis réessayez.";
  }
  return "Impossible de créer le compte. Réessayez.";
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim().replace(/^@/, ''),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(describeSignUpError(signUpError.code, signUpError.status));
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4">
        <div className="w-full max-w-md rounded-3xl border border-neutralBorder bg-neutralCard/80 p-8 text-center shadow-xl backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white">Vérifiez vos emails</h1>
          <p className="mt-3 text-sm text-slate-400">
            Un lien de confirmation a été envoyé à <span className="text-slate-200">{email}</span>. Cliquez dessus pour
            activer votre compte, puis connectez-vous.
          </p>
          <Link href="/auth/login" className="button-primary mt-6 inline-block w-full">
            Aller à la connexion
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutralBorder bg-neutralCard/80 p-8 shadow-xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
        <p className="mt-2 text-sm text-slate-400">Rejoignez la communauté MHA Academy</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm text-slate-300">Prénom</label>
              <input
                id="firstName"
                className="input"
                type="text"
                autoComplete="given-name"
                placeholder="Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm text-slate-300">Nom</label>
              <input
                id="lastName"
                className="input"
                type="text"
                autoComplete="family-name"
                placeholder="Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="mb-2 block text-sm text-slate-300">{"Nom d'utilisateur"}</label>
            <input
              id="username"
              className="input"
              type="text"
              autoComplete="username"
              placeholder="@goji"
              pattern="@?[a-zA-Z0-9_]{3,30}"
              title="3 à 30 caractères : lettres, chiffres ou _"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

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
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={6}
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
            {loading ? 'Inscription…' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Déjà inscrit ?{' '}
          <Link href="/auth/login" className="font-medium text-primaryLight">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
