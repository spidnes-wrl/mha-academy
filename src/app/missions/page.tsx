import Link from 'next/link';

const missions = [
  { title: 'Analyse de données', difficulty: 'Moyen', xp: 120, status: 'À faire' },
  { title: 'Quiz de logique', difficulty: 'Facile', xp: 85, status: 'En cours' },
  { title: 'Projet de stratégie', difficulty: 'Difficile', xp: 210, status: 'Validé' },
  { title: 'Défi d’équipe', difficulty: 'Moyen', xp: 160, status: 'À faire' },
];

const glass = 'border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

export default function MissionsPage() {
  return (
    <main className="min-h-screen bg-[#06120d] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Missions</p>
            <h1 className="mt-2 text-3xl font-black">Défis du jour</h1>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
            Retour au dashboard
          </Link>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {missions.map((mission) => (
            <article key={mission.title} className={`${glass} rounded-3xl p-5`}>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
                  {mission.difficulty}
                </span>
                <span className="text-xs text-white/60">{mission.status}</span>
              </div>

              <h2 className="mt-4 text-xl font-bold">{mission.title}</h2>
              <p className="mt-2 text-sm text-white/70">
                Termine cette mission pour gagner de l’XP et débloquer de nouvelles récompenses.
              </p>

              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-emerald-300">+{mission.xp} XP</span>
                <Link href="/dashboard" className="rounded-lg bg-[#f4ad5a] px-3 py-2 font-semibold text-[#1a1208] hover:bg-[#f7bd78]">
                  Ouvrir
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
