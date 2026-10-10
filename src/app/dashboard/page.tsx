import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutralBg px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Tableau de bord</p>
            <h1 className="mt-2 text-3xl font-bold">Bienvenue, étudiant</h1>
          </div>
          <Link href="/" className="button-secondary">
            Accueil
          </Link>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Points d’examen', '950'],
            ['XP', '2450'],
            ['Classe', 'A'],
            ['Pièces', '520'],
          ].map(([label, value]) => (
            <div key={label} className="card">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-4 text-3xl font-bold text-emerald-300">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
