'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import InstallAppButton from '@/components/InstallAppButton';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successDestination, setSuccessDestination] = useState('/auth/login?registered=1');
  const [continueLabel, setContinueLabel] = useState('Continuer vers la connexion');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const firstName = String(form.get('first_name') || '').trim();
    const lastName = String(form.get('last_name') || '').trim();
    const username = String(form.get('username') || '').trim().replace(/^@/, '').toLowerCase();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setErrorMessage("Le nom d'utilisateur doit contenir 3 à 20 caractères : lettres, chiffres ou _.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, username },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      const destination = data.session ? '/dashboard' : '/auth/login?registered=1';
      setSuccessDestination(destination);
      setContinueLabel(data.session ? 'Accéder à MHA Academy' : 'Continuer vers la connexion');
      setSuccessMessage(data.session
        ? 'Ton compte est prêt. Tu peux maintenant accéder à ton espace MHA Academy.'
        : 'Ton inscription a été enregistrée. Si une confirmation par e-mail est demandée, vérifie ta boîte de réception.');
      formElement.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "L'inscription n'a pas pu aboutir.");
    } finally {
      setLoading(false);
    }
  }

  function leaveRegistrationConfirmation() {
    // Always create an in-app destination so Android's Back button is not
    // the only way out of the post-registration screen.
    router.replace(successDestination);
  }

  return <>
    {successMessage ? <div className="relative mt-8 space-y-5 rounded-2xl border border-[#1B2437] bg-[#0A0D14] p-4 pt-12">
      <button
        type="button"
        onClick={leaveRegistrationConfirmation}
        aria-label="Fermer la confirmation et continuer vers la connexion"
        title="Fermer"
        className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-[#1B2437] bg-[#111827] text-[#BFD2FF] transition hover:border-blue-500 hover:bg-blue-600/20"
      ><X size={20} strokeWidth={1.8}/></button>
      <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4">
        <p className="font-semibold text-[#BFD2FF]">Inscription envoyée</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{successMessage}</p>
      </div>
      <section className="rounded-2xl border border-[#1B2437] bg-black/40 p-4">
        <h2 className="font-semibold text-white">Emporte MHA Academy avec toi</h2>
        <p className="mt-1 text-sm text-[#9AA7C2]">Installe l'application sur ton écran d'accueil pour y accéder comme à une vraie application.</p>
        <InstallAppButton show />
      </section>
      <button type="button" onClick={leaveRegistrationConfirmation} className="button-primary w-full">{continueLabel}</button>
      <p className="text-center text-xs text-[#9AA7C2]">Tu peux fermer cet écran avec la croix en haut à droite.</p>
    </div> : <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="first_name" className="mb-2 block text-sm text-slate-300">Prénom</label><input id="first_name" name="first_name" className="input" autoComplete="given-name" placeholder="Jean" required /></div>
        <div><label htmlFor="last_name" className="mb-2 block text-sm text-slate-300">Nom</label><input id="last_name" name="last_name" className="input" autoComplete="family-name" placeholder="Dupont" required /></div>
      </div>
      <div><label htmlFor="username" className="mb-2 block text-sm text-slate-300">Nom d'utilisateur</label><input id="username" name="username" className="input" autoComplete="username" placeholder="goji" minLength={3} maxLength={20} required /><p className="mt-1 text-xs text-[#9AA7C2]">3 à 20 caractères : lettres, chiffres et _.</p></div>
      <div><label htmlFor="email" className="mb-2 block text-sm text-slate-300">E-mail</label><input id="email" name="email" className="input" type="email" autoComplete="email" placeholder="etudiant@academy.fr" required /></div>
      <div><label htmlFor="password" className="mb-2 block text-sm text-slate-300">Mot de passe</label><input id="password" name="password" className="input" type="password" autoComplete="new-password" minLength={8} placeholder="8 caractères minimum" required /></div>
      {errorMessage && <p role="alert" className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 text-sm text-[#BFD2FF]">{errorMessage}</p>}
      <button type="submit" disabled={loading} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Création du compte…' : "S'inscrire"}</button>
    </form>}
    <p className="mt-6 text-center text-sm text-[#9AA7C2]">Déjà inscrit ?{' '}<Link href="/auth/login" className="font-semibold text-[#BFD2FF]">Se connecter</Link></p>
  </>;
}
