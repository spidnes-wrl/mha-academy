import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutralBg px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutralBorder bg-neutralCard/80 p-8 shadow-xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
        <p className="mt-2 text-sm text-slate-400">Rejoignez la communauté MHA Academy</p>

        <form className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Prénom</label>
              <input className="input" type="text" placeholder="Jean" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Nom</label>
              <input className="input" type="text" placeholder="Dupont" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Nom d'utilisateur</label>
            <input className="input" type="text" placeholder="@goji" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input className="input" type="email" placeholder="etudiant@academy.fr" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Mot de passe</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>

          <button type="button" className="button-primary w-full">
            S'inscrire
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Déjà inscrit ?{' '}
          <Link href="/auth/login" className="font-medium text-primaryLight">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
