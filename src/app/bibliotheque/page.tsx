import Link from 'next/link';

const resources = [
  { title: 'Cours de base', category: 'Algorithme', lessons: '12 leçons' },
  { title: 'Guide de logique', category: 'Maths', lessons: '8 leçons' },
  { title: 'Notes de stratégie', category: 'Gestion', lessons: '6 leçons' },
  { title: 'Ressources d’étude', category: 'Communication', lessons: '10 leçons' },
  { title: 'Cahier de missions', category: 'Projet', lessons: '9 leçons' },
  { title: 'Analyse avancée', category: 'Data', lessons: '7 leçons' },
];

const glass = 'border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

export default function BibliothequePage() {
  return (
    <main className="min-h-screen bg-[#06120d] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Bibliothèque</p>
            <h1 className="mt-2 text-3xl font-black">Ressources académiques</h1>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
            Retour au dashboard
          </Link>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <article key={resource.title} className={`${glass} rounded-3xl p-5`}>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">{resource.category}</p>
              <h2 className="mt-3 text-xl font-bold">{resource.title}</h2>
              <p className="mt-2 text-sm text-white/70">{resource.lessons}</p>

              <div className="mt-5">
                <Link href="/dashboard" className="inline-flex rounded-xl bg-[#f4ad5a] px-4 py-2 text-sm font-semibold text-[#1a1208] hover:bg-[#f7bd78]">
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
