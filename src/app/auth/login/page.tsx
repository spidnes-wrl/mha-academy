import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
export default function LoginPage() {
 return <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4 py-8">
  <div className="w-full max-w-md rounded-3xl border border-neutralBorder bg-neutralCard/80 p-8 shadow-xl backdrop-blur-sm">
   <div className="mb-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primaryGreen text-xl font-black text-white">M</span><div><p className="font-bold tracking-wide text-white">MHA ACADEMY</p><p className="text-xs text-slate-400">Content de te retrouver</p></div></div>
   <h1 className="text-3xl font-bold text-white">Connexion</h1>
   <p className="mt-2 text-sm text-slate-400">Connecte-toi pour retrouver ton espace.</p>
   <LoginForm />
   <p className="mt-6 text-center text-sm text-slate-400">Pas encore de compte ?{' '}<Link href="/auth/register" className="font-medium text-primaryLight">Créer un compte</Link></p>
  </div>
 </main>;
}