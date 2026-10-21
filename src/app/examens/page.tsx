import Link from 'next/link';

const exams = [
  { title: 'Examen - Structures de données', duration: '25 min', score: '75%', status: 'À passer' },
  { title: 'Quiz - Mathématiques appliquées', duration: '15 min', score: '90%', status: 'Validé' },
  { title: 'Contrôle - Logique algorithmique', duration: '30 min', score: '—', status: 'À venir' },
  { title: 'Mini test - Langage et communication', duration: '10 min', score: '80%', status: 'Validé' },
];

const glass = 'border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

export default function ExamensPage() {
  return (
    <main className="min-h-screen bg-[#06120d] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Examens</p>
            <h1 className="mt-2 text-3xl font-black">Évaluations</h1>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
            Retour au dashboard
          </Link>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <article key={exam.title} className={`${glass} rounded-3xl p-5`}>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
                  {exam.status}
                </span>
                <span className="text-sm text-white/60">{exam.duration}</span>
              </div>

              <h2 className="mt-4 text-xl font-bold">{exam.title}</h2>
              <p className="mt-3 text-sm text-white/70">Résultat : {exam.score}</p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm text-emerald-300">Score actuel : {exam.score}</span>
                <button className="rounded-xl bg-[#f4ad5a] px-4 py-2 font-semibold text-[#1a1208] hover:bg-[#f7bd78]">
                  Commencer
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
