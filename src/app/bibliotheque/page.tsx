import Link from 'next/link';

const resources = [
  { title: 'Cours de base', category: 'Algorithme', lessons: '12 leçons' },
  { title: 'Guide de logique', category: 'Maths', lessons: '8 leçons' },
  { title: 'Notes de stratégie', category: 'Gestion', lessons: '6 leçons' },
  { title: 'Ressources d’étude', category: 'Communication', lessons: '10 leçons' },
  { title: 'Cahier de missions', category: 'Projet', lessons: '9 leçons' },
  { title: 'Analyse avancée', category: 'Data', lessons: '7 leçons' },
];

export default function BibliothequePage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Bibliothèque</span>
          <h1 className="page-header__title">Ressources académiques</h1>
        </div>

        <Link href="/dashboard" className="secondary-button">Retour au dashboard</Link>
      </header>

      <section className="card-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {resources.map((resource) => (
          <article key={resource.title} className="task-card glass-panel">
            <span className="pill" style={{ display: 'inline-flex' }}>{resource.category}</span>
            <h2 style={{ marginTop: 18, fontSize: '1.35rem' }}>{resource.title}</h2>
            <p style={{ marginTop: 12 }}>{resource.lessons}</p>

            <div style={{ marginTop: 22 }}>
              <Link href="/dashboard" className="button-primary" style={{ padding: '10px 14px', fontSize: '0.8rem' }}>
                Ouvrir
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
