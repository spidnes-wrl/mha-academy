import Link from 'next/link';

const missions = [
  { title: 'Analyse de données', difficulty: 'Moyen', xp: 120, status: 'À faire' },
  { title: 'Quiz de logique', difficulty: 'Facile', xp: 85, status: 'En cours' },
  { title: 'Projet de stratégie', difficulty: 'Difficile', xp: 210, status: 'Validé' },
  { title: 'Défi d’équipe', difficulty: 'Moyen', xp: 160, status: 'À faire' },
];

export default function MissionsPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Missions</span>
          <h1 className="page-header__title">Défis du jour</h1>
        </div>

        <Link href="/dashboard" className="secondary-button">Retour au dashboard</Link>
      </header>

      <section className="card-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {missions.map((mission) => (
          <article key={mission.title} className="task-card glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span className="pill">{mission.difficulty}</span>
              <span style={{ color: 'var(--mha-muted)', fontSize: '0.75rem' }}>{mission.status}</span>
            </div>

            <h2 style={{ marginTop: 18, fontSize: '1.35rem' }}>{mission.title}</h2>
            <p style={{ marginTop: 12 }}>Termine cette mission pour gagner de l’XP et débloquer de nouvelles récompenses.</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
              <span style={{ color: '#8cffc0', fontWeight: 800 }}>+{mission.xp} XP</span>
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
