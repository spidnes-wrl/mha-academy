import Link from 'next/link';

const items = [
  { name: 'Pack de compétences', price: '250 pièces', category: 'Boost' },
  { name: 'Badge d’élite', price: '500 pièces', category: 'Cosmétique' },
  { name: 'Cours premium', price: '350 pièces', category: 'Ressource' },
  { name: 'Potion de focus', price: '180 pièces', category: 'Bonus' },
  { name: 'Survival kit', price: '420 pièces', category: 'Ressource' },
  { name: 'Avatar légendaire', price: '650 pièces', category: 'Cosmétique' },
];

export default function BoutiquePage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Boutique</span>
          <h1 className="page-header__title">Ressources et bonus</h1>
        </div>

        <Link href="/dashboard" className="secondary-button">Retour au dashboard</Link>
      </header>

      <section className="card-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {items.map((item) => (
          <article key={item.name} className="shop-card glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffd38a' }}>
              <span>{item.category}</span>
              <span>Stock</span>
            </div>

            <h2 style={{ marginTop: 18, fontSize: '1.35rem' }}>{item.name}</h2>
            <p style={{ marginTop: 12 }}>Débloque des avantages pour améliorer ta progression.</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffd38a' }}>{item.price}</span>
              <button type="button" className="secondary-button">Acheter</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
