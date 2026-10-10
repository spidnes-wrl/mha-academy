import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-neutralBg px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Administration</p>
            <h1 className="mt-2 text-3xl font-bold">Panneau directeur</h1>
          </div>
          <Link href="/" className="button-secondary">
            Retour
          </Link>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Étudiants', '50'],
            ['Examens', '12'],
            ['Missions', '8'],
            ['Événements', '3'],
          ].map(([label, value]) => (
            <div key={label} className="card">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-4 text-3xl font-bold text-amber-300">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {['Étudiants', 'Académie', 'Boutique', 'Économie', 'Communauté', 'Sécurité'].map((section) => (
            <div key={section} className="card">
              <p className="text-lg font-semibold">{section}</p>
              <p className="mt-3 text-sm text-slate-400">Module accessible côté serveur et contrôlé par les permissions.</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
