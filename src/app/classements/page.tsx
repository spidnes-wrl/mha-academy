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

export default function ClassementsPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Classements</span>
          <h1 className="page-header__title">Leaderboard & classes</h1>
        </div>

        <Link href="/dashboard" className="secondary-button">Retour au dashboard</Link>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
        <div className="content-panel glass-panel">
          <h2 style={{ fontSize: '1.6rem', marginBottom: 18 }}>Classement global</h2>

          <div style={{ display: 'grid', gap: 12 }}>
            {leaderboard.map((student) => (
              <div key={student.name} className="resource-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.3rem' }}>{student.badge}</span>
                  <span>{student.name}</span>
                </div>
                <span style={{ color: '#8cffc0', fontWeight: 700 }}>{student.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-panel glass-panel">
          <h2 style={{ fontSize: '1.6rem', marginBottom: 18 }}>Performances par classe</h2>

          <div style={{ display: 'grid', gap: 12 }}>
            {classes.map((item) => (
              <div key={item.name} className="resource-item">
                <span>{item.name}</span>
                <small style={{ color: '#8fe9ff' }}>{item.value}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
