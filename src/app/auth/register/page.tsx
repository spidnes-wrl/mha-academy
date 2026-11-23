import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';
export default function RegisterPage() {
  return <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4 py-8">
    <div className="mha-glass w-full max-w-md rounded-3xl p-7 sm:p-8">
      <div className="mb-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f4b879] text-xl font-black text-black">M</span><div><p className="font-bold tracking-wide text-white">MHA ACADEMY</p><p className="text-xs text-neutral-400">Ton espace commence ici</p></div></div>
      <span className="mha-sticker">JOIN THE ACADEMY</span><h1 className="mt-4 text-3xl font-black text-white">Créer un compte</h1>
      <p className="mt-2 text-sm text-neutral-400">Rejoins ton académie et retrouve ton espace sur mobile.</p><RegisterForm />
      <p className="mt-6 text-center text-sm text-neutral-400">Déjà inscrit ?{' '}<Link href="/auth/login" className="font-semibold text-[#f4b879]">Se connecter</Link></p>
    </div>
  </main>;
}
