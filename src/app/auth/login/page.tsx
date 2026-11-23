import Link from 'next/link';
import LoginForm from '@/components/LoginForm';

export default function LoginPage({ searchParams }: { searchParams?: { registered?: string } }) {
 return <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4 py-8">
  <div className="mha-glass w-full max-w-md rounded-3xl p-7 sm:p-8">
   <div className="mb-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-blue-500/40 bg-blue-600 text-xl font-black text-white">M</span><div><p className="font-bold tracking-wide text-white">MHA ACADEMY</p><p className="text-xs text-[#9AA7C2]">Content de te retrouver</p></div></div>
   <span className="mha-sticker">WELCOME BACK</span><h1 className="mt-4 text-3xl font-bold text-white">Connexion</h1>
   <p className="mt-2 text-sm text-[#9AA7C2]">Connecte-toi pour retrouver ton espace.</p>
   {searchParams?.registered === '1' && <p role="status" className="mt-5 rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 text-sm leading-6 text-[#BFD2FF]">Ton inscription a bien été envoyée. Si une confirmation par e-mail est demandée, confirme ton adresse avant de te connecter.</p>}
   <LoginForm />
   <p className="mt-6 text-center text-sm text-[#9AA7C2]">Pas encore de compte ?{' '}<Link href="/auth/register" className="font-semibold text-[#BFD2FF]">Créer un compte</Link></p>
  </div>
 </main>;
}
