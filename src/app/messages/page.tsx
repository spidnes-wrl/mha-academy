import Link from 'next/link';

const conversations = [
  { name: 'Clan Phoenix', status: '3 nouveaux messages', tone: 'text-emerald-300' },
  { name: 'Groupe de maths', status: '2 réponses', tone: 'text-cyan-300' },
  { name: 'Tutorat', status: '1 rappel', tone: 'text-fuchsia-300' },
];

const clans = ['Phoenix', 'Dragon', 'Hawk', 'Orion'];

const glass = 'border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-[#06120d] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Messages & clans</p>
            <h1 className="mt-2 text-3xl font-black">Communication</h1>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
            Retour au dashboard
          </Link>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className={`${glass} rounded-3xl p-5`}>
            <h2 className="text-xl font-bold">Conversations</h2>
            <div className="mt-5 space-y-3">
              {conversations.map((conversation) => (
                <div key={conversation.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className="font-medium">{conversation.name}</p>
                    <p className="text-sm text-white/60">Dernière activité aujourd’hui</p>
                  </div>
                  <span className={`text-xs font-semibold ${conversation.tone}`}>{conversation.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${glass} rounded-3xl p-5`}>
            <h2 className="text-xl font-bold">Clans actifs</h2>
            <ul className="mt-5 space-y-3">
              {clans.map((clan) => (
                <li key={clan} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span>{clan}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">En ligne</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
