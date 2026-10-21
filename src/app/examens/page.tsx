import Link from 'next/link';

const exams = [
  { title: 'Examen - Structures de données', duration: '25 min', score: '75%', status: 'À passer' },
  { title: 'Quiz - Mathématiques appliquées', duration: '15 min', score: '90%', status: 'Validé' },
  { title: 'Contrôle - Logique algorithmique', duration: '30 min', score: '—', status: 'À venir' },
  { title: 'Mini test - Langage et communication', duration: '10 min', score: '80%', status: 'Validé' },
];

export default function ExamensPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Examens</span>
          <h1 className="page-header__title">Évaluations</h1>
        </div>

        <Link href="/dashboard" className="secondary-button">Retour au dashboard</Link>
      </header>

      <section className="card-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        {exams.map((exam) => (
          <article key={exam.title} className="task-card glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span className="pill">{exam.status}</span>
              <span style={{ color: 'var(--mha-muted)', fontSize: '0.8rem' }}>{exam.duration}</span>
            </div>

            <h2 style={{ marginTop: 18, fontSize: '1.35rem' }}>{exam.title}</h2>
            <p style={{ marginTop: 12 }}>Résultat : {exam.score}</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
              <span style={{ color: '#8cffc0', fontWeight: 800 }}>Score actuel : {exam.score}</span>
              <button type="button" className="button-primary" style={{ padding: '10px 14px', fontSize: '0.8rem' }}>
                Commencer
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
