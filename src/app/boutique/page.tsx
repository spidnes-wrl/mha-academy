import Link from 'next/link';

const items = [
  { name: 'Pack de compétences', price: '250 pièces', category: 'Boost' },
  { name: 'Badge d’élite', price: '500 pièces', category: 'Cosmétique' },
  { name: 'Cours premium', price: '350 pièces', category: 'Ressource' },
  { name: 'Potion de focus', price: '180 pièces', category: 'Bonus' },
  { name: 'Survival kit', price: '420 pièces', category: 'Ressource' },
  { name: 'Avatar légendaire', price: '650 pièces', category: 'Cosmétique' },
];

const glass = 'border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

export default function BoutiquePage() {
  return (
    <main className="min-h-screen bg-[#06120d] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Boutique</p>
            <h1 className="mt-2 text-3xl font-black">Ressources et bonus</h1>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
            Retour au dashboard
          </Link>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.name} className={`${glass} rounded-3xl p-5`}>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-amber-200">
                <span>{item.category}</span>
                <span>Stock</span>
              </div>

              <h2 className="mt-4 text-xl font-bold">{item.name}</h2>
              <p className="mt-2 text-sm text-white/70">Débloque des avantages pour améliorer ta progression.</p>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-lg font-bold text-amber-300">{item.price}</span>
                <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium hover:bg-white/10">
                  Acheter
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
