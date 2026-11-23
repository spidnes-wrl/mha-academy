'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import InstallAppButton from '@/components/InstallAppButton';
export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErrorMessage(''); setSuccessMessage(''); setLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const firstName = String(form.get('first_name') || '').trim();
    const lastName = String(form.get('last_name') || '').trim();
    const username = String(form.get('username') || '').trim().replace(/^@/, '').toLowerCase();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');
    if (!/^[a-z0-9_]{3,20}$/.test(username)) { setErrorMessage("Le nom d'utilisateur doit contenir 3 à 20 caractères : lettres, chiffres ou _."); setLoading(false); return; }
    if (password.length < 8) { setErrorMessage('Le mot de passe doit contenir au moins 8 caractères.'); setLoading(false); return; }
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName, username } } });
      if (error) throw error;
      setSuccessMessage("Ton inscription a été enregistrée. Si une confirmation par e-mail est demandée, vérifie ta boîte de réception.");
      formElement.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "L'inscription n'a pas pu aboutir.");
    } finally { setLoading(false); }
  }
  return <>
    {successMessage ? <div className="mt-8 space-y-5">
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4"><p className="font-semibold text-emerald-200">Inscription envoyée</p><p className="mt-2 text-sm leading-6 text-slate-300">{successMessage}</p></div>
      <section className="rounded-2xl border border-neutralBorder bg-slate-950/40 p-4"><h2 className="font-semibold text-white">Emporte MHA Academy avec toi</h2><p className="mb-4 mt-1 text-sm text-slate-400">Installe l'application sur ton écran d'accueil pour y accéder comme à une vraie application.</p><InstallAppButton show /></section>
      <Link href="/auth/login" className="button-secondary block w-full text-center">Continuer vers la connexion</Link>
    </div> : <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="first_name" className="mb-2 block text-sm text-slate-300">Prénom</label><input id="first_name" name="first_name" className="input" autoComplete="given-name" placeholder="Jean" required /></div>
        <div><label htmlFor="last_name" className="mb-2 block text-sm text-slate-300">Nom</label><input id="last_name" name="last_name" className="input" autoComplete="family-name" placeholder="Dupont" required /></div>
      </div>
      <div><label htmlFor="username" className="mb-2 block text-sm text-slate-300">Nom d'utilisateur</label><input id="username" name="username" className="input" autoComplete="username" placeholder="goji" minLength={3} maxLength={20} required /><p className="mt-1 text-xs text-slate-500">3 à 20 caractères : lettres, chiffres et _.</p></div>
      <div><label htmlFor="email" className="mb-2 block text-sm text-slate-300">E-mail</label><input id="email" name="email" className="input" type="email" autoComplete="email" placeholder="etudiant@academy.fr" required /></div>
      <div><label htmlFor="password" className="mb-2 block text-sm text-slate-300">Mot de passe</label><input id="password" name="password" className="input" type="password" autoComplete="new-password" minLength={8} placeholder="8 caractères minimum" required /></div>
      {errorMessage && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{errorMessage}</p>}
      <button type="submit" disabled={loading} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Création du compte…' : "S'inscrire"}</button>
    </form>}
    <div className="hidden"><InstallAppButton show={false} /></div>
  </>;
}