'use client';
import { FormEvent, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function LoginForm() {
 const [loading,setLoading]=useState(false);
 const [errorMessage,setErrorMessage]=useState('');
 async function handleSubmit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setLoading(true);setErrorMessage('');
  const form=new FormData(event.currentTarget);
  const email=String(form.get('email')||'').trim().toLowerCase();
  const password=String(form.get('password')||'');
  try{
   const supabase=createBrowserSupabaseClient();
   const {error}=await supabase.auth.signInWithPassword({email,password});
   if(error)throw error;
   // Force a fresh document request so the server receives the newly written
   // Supabase auth cookies before rendering protected pages.
   window.location.replace('/dashboard');
  }catch(error){setErrorMessage(error instanceof Error?error.message:'Connexion impossible.');setLoading(false);}
 }
 return <form onSubmit={handleSubmit} className="mt-8 space-y-5">
  <div><label htmlFor="email" className="mb-2 block text-sm text-slate-300">E-mail</label><input id="email" name="email" className="input" type="email" autoComplete="email" placeholder="etudiant@academy.fr" required /></div>
  <div><label htmlFor="password" className="mb-2 block text-sm text-slate-300">Mot de passe</label><input id="password" name="password" className="input" type="password" autoComplete="current-password" placeholder="••••••••" required /></div>
  {errorMessage&&<p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{errorMessage}</p>}
  <button type="submit" disabled={loading} className="button-primary w-full disabled:opacity-60">{loading?'Connexion…':'Se connecter'}</button>
 </form>;
}
