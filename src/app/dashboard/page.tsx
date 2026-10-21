import Link from 'next/link';

const stats = [
  { label: 'XP total', value: '4 800', tone: 'text-emerald-300' },
  { label: 'Pièces', value: '1 250', tone: 'text-amber-300' },
  { label: 'Classe', value: 'Classe B', tone: 'text-cyan-300' },
  { label: 'Rang', value: 'Intermédiaire', tone: 'text-fuchsia-300' },
];

const shortcuts = [
  { title: 'Missions', href: '/missions', badge: '4 actives' },
  { title: 'Examens', href: '/examens', badge: '2 à passer' },
  { title: 'Boutique', href: '/boutique', badge: '8 objets' },
  { title: 'Bibliothèque', href: '/bibliotheque', badge: '12 ressources' },
  { title: 'Messages', href: '/messages', badge: '3 clans' },
  { title: 'Classements', href: '/classements', badge: 'Top 12%' },
];

const glass = 'border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#06120d] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Tableau de bord</p>
            <h1 className="mt-2 text-3xl font-black">Bienvenue, Sora</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5">
              Accueil
            </Link>
            <Link href="/auth/login" className="rounded-xl bg-[#f4ad5a] px-4 py-2 text-sm font-bold text-[#1a1208] hover:bg-[#f7bd78]">
              Se déconnecter
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className={`${glass} rounded-2xl p-5`}>
              <p className="text-sm text-white/60">{stat.label}</p>
              <p className={`mt-3 text-3xl font-black ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className={`${glass} rounded-3xl p-6`}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-extrabold">Progression</h2>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                72% terminé
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {[
                { label: 'Cours terminés', value: '12 / 18', width: 'w-[67%]' },
                { label: 'Quiz validés', value: '18 / 24', width: 'w-[75%]' },
                { label: 'Missions accomplies', value: '8 / 10', width: 'w-[80%]' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm text-white/70">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: item.width.replace('w-[', '').replace(']', '') }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${glass} rounded-3xl p-6`}>
            <h2 className="text-xl font-bold">Raccourcis</h2>
            <div className="mt-5 space-y-3">
              {shortcuts.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-white/50">{item.badge}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

