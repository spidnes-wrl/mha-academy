import Link from 'next/link';

const rows = [
  { id: 'M-104', players: 'Sora vs Aiko', status: 'active', bet: '120 pts', reward: '250 XP' },
  { id: 'M-105', players: 'Ren vs Mika', status: 'pending', bet: '80 pts', reward: '180 XP' },
  { id: 'M-106', players: 'Yuna vs Sora', status: 'completed', bet: '150 pts', reward: '320 XP' },
  { id: 'M-107', players: 'Eli vs Nia', status: 'active', bet: '200 pts', reward: '420 XP' },
];

export default function MatchesPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Matchs</span>
          <h1 className="page-header__title">Historique & matchs actifs</h1>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/arena" className="secondary-button">Arena</Link>
          <Link href="/dashboard" className="secondary-button">Dashboard</Link>
        </div>
      </header>

      <section className="content-panel glass-panel">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--mha-muted)' }}>
              <th style={{ padding: '0 0 16px' }}>Match</th>
              <th style={{ padding: '0 0 16px' }}>Joueurs</th>
              <th style={{ padding: '0 0 16px' }}>Statut</th>
              <th style={{ padding: '0 0 16px' }}>Mise</th>
              <th style={{ padding: '0 0 16px' }}>Récompense</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '14px 0', fontWeight: 700 }}>{row.id}</td>
                <td style={{ padding: '14px 0' }}>{row.players}</td>
                <td style={{ padding: '14px 0' }}>
                  <span className="pill" style={{ letterSpacing: '0.08em' }}>{row.status}</span>
                </td>
                <td style={{ padding: '14px 0' }}>{row.bet}</td>
                <td style={{ padding: '14px 0' }}>{row.reward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
