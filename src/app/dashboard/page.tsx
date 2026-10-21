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

const progress = [
  { label: 'Cours terminés', value: '12 / 18', width: '67%' },
  { label: 'Quiz validés', value: '18 / 24', width: '75%' },
  { label: 'Missions accomplies', value: '8 / 10', width: '80%' },
];

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Tableau de bord</span>
          <h1 className="page-header__title">Bienvenue, Sora</h1>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/" className="secondary-button">Accueil</Link>
          <Link href="/auth/login" className="button-primary">Se déconnecter</Link>
        </div>
      </header>

      <section className="metric-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card glass-panel">
            <span className="stat-card__label">{stat.label}</span>
            <div className={`stat-card__value ${stat.tone}`}>{stat.value}</div>
          </article>
        ))}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 24 }}>
        <div className="progress-card glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <h2 style={{ fontSize: '2rem' }}>Progression</h2>
            <span className="pill">72% terminé</span>
          </div>

          <div className="progress-list">
            {progress.map((item) => (
              <div key={item.label} className="progress-item">
                <div className="progress-item__meta">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="progress-track">
                  <span className="progress-fill" style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="sidebar-panel glass-panel">
          <h2 style={{ fontSize: '1.5rem', marginBottom: 18 }}>Raccourcis</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {shortcuts.map((item) => (
              <Link key={item.title} href={item.href} className="quick-link">
                <span>{item.title}</span>
                <small>{item.badge}</small>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
