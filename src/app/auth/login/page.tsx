import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
export default function LoginPage() {
 return <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4 py-8">
  <div className="mha-glass w-full max-w-md rounded-3xl p-7 sm:p-8">
   <div className="mb-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f4b879] text-xl font-black text-black">M</span><div><p className="font-bold tracking-wide text-white">MHA ACADEMY</p><p className="text-xs text-neutral-400">Content de te retrouver</p></div></div>
   <span className="mha-sticker">WELCOME BACK</span><h1 className="mt-4 text-3xl font-black text-white">Connexion</h1>
   <p className="mt-2 text-sm text-neutral-400">Connecte-toi pour retrouver ton espace.</p><LoginForm />
   <p className="mt-6 text-center text-sm text-neutral-400">Pas encore de compte ?{' '}<Link href="/auth/register" className="font-semibold text-[#f4b879]">Créer un compte</Link></p>
  </div>
 </main>;
}
