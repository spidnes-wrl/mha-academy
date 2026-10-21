import Link from 'next/link';

const conversations = [
  { name: 'Clan Phoenix', status: '3 nouveaux messages', tone: 'text-emerald-300' },
  { name: 'Groupe de maths', status: '2 réponses', tone: 'text-cyan-300' },
  { name: 'Tutorat', status: '1 rappel', tone: 'text-fuchsia-300' },
];

const clans = ['Phoenix', 'Dragon', 'Hawk', 'Orion'];

export default function MessagesPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Messages & clans</span>
          <h1 className="page-header__title">Communication</h1>
        </div>

        <Link href="/dashboard" className="secondary-button">Retour au dashboard</Link>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24 }}>
        <div className="content-panel glass-panel">
          <h2 style={{ fontSize: '1.6rem', marginBottom: 18 }}>Conversations</h2>

          <div style={{ display: 'grid', gap: 12 }}>
            {conversations.map((conversation) => (
              <div key={conversation.name} className="resource-item">
                <div>
                  <strong>{conversation.name}</strong>
                  <p style={{ marginTop: 4 }}>Dernière activité aujourd’hui</p>
                </div>
                <span className="pill" style={{ color: '#8cffc0' }}>{conversation.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-panel glass-panel">
          <h2 style={{ fontSize: '1.6rem', marginBottom: 18 }}>Clans actifs</h2>

          <div style={{ display: 'grid', gap: 12 }}>
            {clans.map((clan) => (
              <div key={clan} className="resource-item">
                <span>{clan}</span>
                <span className="pill">En ligne</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
