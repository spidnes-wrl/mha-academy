import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutralBorder bg-neutralCard/80 p-8 shadow-xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white">Connexion</h1>
        <p className="mt-2 text-sm text-slate-400">Bienvenue sur MHA Academy</p>

        <form className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input className="input" type="email" placeholder="etudiant@academy.fr" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Mot de passe</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>

          <button type="button" className="button-primary w-full">
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="font-medium text-primaryLight">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
