import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-neutralBorder bg-neutralCard/80 p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primaryGreen text-xl font-black text-white">M</span>
          <div><p className="font-bold tracking-wide text-white">MHA ACADEMY</p><p className="text-xs text-slate-400">Ton espace commence ici</p></div>
        </div>
        <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
        <p className="mt-2 text-sm text-slate-400">Rejoins ton académie et retrouve ton espace sur mobile.</p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-slate-400">
          Déjà inscrit ?{' '}
          <Link href="/auth/login" className="font-medium text-primaryLight">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}
