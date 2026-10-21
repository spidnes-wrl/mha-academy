import Link from 'next/link';

const players = [
  { name: 'Aiko', rank: 'Classe A', lp: 1820 },
  { name: 'Sora', rank: 'Classe B', lp: 1710 },
  { name: 'Ren', rank: 'Classe C', lp: 1600 },
  { name: 'Mika', rank: 'Classe A', lp: 1750 },
];

export default function GamePage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Game</span>
          <h1 className="page-header__title">Duel live</h1>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/arena" className="secondary-button">Arena</Link>
          <Link href="/matches" className="secondary-button">Matchs</Link>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="content-panel glass-panel">
          <h2 style={{ fontSize: '1.6rem', marginBottom: 18 }}>Challenge</h2>

          <div style={{ display: 'grid', gap: 16 }}>
            <div className="resource-item">
              <div>
                <strong>Adversaire</strong>
                <p style={{ marginTop: 6 }}>Aiko • Classe A</p>
              </div>
              <span className="pill">Prêt</span>
            </div>

            <div className="resource-item">
              <div>
                <strong>Type</strong>
                <p style={{ marginTop: 6 }}>Match rapide • 8 minutes</p>
              </div>
              <span className="pill">Public</span>
            </div>

            <div className="resource-item">
              <div>
                <strong>Récompense</strong>
                <p style={{ marginTop: 6 }}>250 XP + 120 pièces</p>
              </div>
              <span className="pill">Bonus</span>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <button type="button" className="button-primary">Défier maintenant</button>
          </div>
        </div>

        <aside className="sidebar-panel glass-panel">
          <h2 style={{ fontSize: '1.5rem', marginBottom: 18 }}>Joueurs disponibles</h2>

          <div style={{ display: 'grid', gap: 12 }}>
            {players.map((player) => (
              <div key={player.name} className="resource-item">
                <div>
                  <strong>{player.name}</strong>
                  <p style={{ marginTop: 4 }}>{player.rank}</p>
                </div>
                <span style={{ color: '#8cffc0', fontWeight: 700 }}>{player.lp} LP</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
