import Link from 'next/link';

const leaderboard = [
  { name: 'Aiko', score: '4 200 XP', badge: '🥇' },
  { name: 'Sora', score: '3 980 XP', badge: '🥈' },
  { name: 'Ren', score: '3 650 XP', badge: '🥉' },
  { name: 'Mika', score: '3 420 XP', badge: '4' },
  { name: 'Yuna', score: '3 210 XP', badge: '5' },
];

const classes = [
  { name: 'Classe A', value: '92% de réussite' },
  { name: 'Classe B', value: '88% de réussite' },
  { name: 'Classe C', value: '84% de réussite' },
  { name: 'Classe E', value: '79% de réussite' },
  { name: 'Terminal S', value: '94% de réussite' },
];

const glass = 'border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

export default function ClassementsPage() {
  return (
    <main className="min-h-screen bg-[#06120d] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Classements</p>
            <h1 className="mt-2 text-3xl font-black">Leardboard & classes</h1>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
            Retour au dashboard
          </Link>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className={`${glass} rounded-3xl p-5`}>
            <h2 className="text-xl font-bold">Classement global</h2>
            <div className="mt-5 space-y-3">
              {leaderboard.map((student) => (
                <div key={student.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{student.badge}</span>
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <span className="text-sm text-emerald-300">{student.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${glass} rounded-3xl p-5`}>
            <h2 className="text-xl font-bold">Performances par classe</h2>
            <div className="mt-5 space-y-3">
              {classes.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-cyan-300">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
