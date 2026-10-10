import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutralBg text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-12">
        <div className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-neutralBorder bg-neutralCard/70 px-4 py-2 text-sm text-emerald-200">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          MHA ACADEMY
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-emerald-300">
              Plateforme académique
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-6xl">
              Créez une <span className="text-primaryLight">expérience</span> d’apprentissage moderne.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Gestion des étudiants, missions, quiz, boutique, classes, points, XP, événements et suivi administratif dans une interface claire et professionnelle.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/auth/login" className="rounded-xl bg-primaryGreen px-6 py-3 font-medium text-white shadow-glow transition hover:bg-primaryLight">
                Se connecter
              </Link>
              <Link href="/auth/register" className="rounded-xl border border-neutralBorder bg-neutralCard px-6 py-3 font-medium text-white transition hover:border-primaryLight hover:text-primaryLight">
                Créer un compte
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-neutralBorder bg-neutralCard/70 p-6 backdrop-blur-sm">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p className="text-sm text-slate-300">Résumé</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-900/60 p-4">
                  <p className="text-xs uppercase text-slate-400">Étudiants</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-300">50</p>
                </div>
                <div className="rounded-2xl bg-slate-900/60 p-4">
                  <p className="text-xs uppercase text-slate-400">Classes</p>
                  <p className="mt-2 text-3xl font-bold text-amber-300">A/B/C/E/S</p>
                </div>
                <div className="rounded-2xl bg-slate-900/60 p-4">
                  <p className="text-xs uppercase text-slate-400">Points</p>
                  <p className="mt-2 text-3xl font-bold text-rose-300">1200</p>
                </div>
                <div className="rounded-2xl bg-slate-900/60 p-4">
                  <p className="text-xs uppercase text-slate-400">XP</p>
                  <p className="mt-2 text-3xl font-bold text-cyan-300">4800</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
