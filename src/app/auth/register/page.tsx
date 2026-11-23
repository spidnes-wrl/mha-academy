import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';
export default function RegisterPage() {
  return <main className="flex min-h-screen items-center justify-center bg-black px-4 py-8">
    <div className="mha-glass w-full max-w-md rounded-3xl p-7 sm:p-8">
      <div className="mb-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-blue-500/40 bg-blue-600 text-xl font-black text-white">M</span><div><p className="font-bold tracking-wide text-white">MHA ACADEMY</p><p className="text-xs text-[#9AA7C2]">Ton espace commence ici</p></div></div>
      <span className="mha-sticker">JOIN THE ACADEMY</span><h1 className="mt-4 text-3xl font-bold text-white">Créer un compte</h1>
      <p className="mt-2 text-sm text-[#9AA7C2]">Rejoins ton académie et retrouve ton espace sur mobile.</p><RegisterForm />
      <p className="mt-6 text-center text-sm text-[#9AA7C2]"><Link href="/" className="font-semibold text-[#BFD2FF]">Retour à l'accueil</Link></p>
    </div>
  </main>;
}
