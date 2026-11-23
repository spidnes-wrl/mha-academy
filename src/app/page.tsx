import Link from 'next/link';
import { ArrowUpRight, BookOpen, MessageCircle, Shield, Sparkles, Trophy, Users, UserRound } from 'lucide-react';

const spaces = [
  { href: '/dashboard', label: 'Mon espace', detail: 'Profil, progression et récompenses', Icon: UserRound, tone: 'text-emerald-300 bg-emerald-300/10' },
  { href: '/clans', label: 'Clans', detail: 'Trouver un clan et suivre son évolution', Icon: Shield, tone: 'text-amber-300 bg-amber-300/10' },
  { href: '/academie', label: 'Académie', detail: 'Cours, missions et évaluations', Icon: BookOpen, tone: 'text-cyan-300 bg-cyan-300/10' },
  { href: '/communaute', label: 'Communauté', detail: 'Discussions et actualités', Icon: Users, tone: 'text-violet-300 bg-violet-300/10' },
  { href: '/detente', label: 'Détente', detail: 'Quiz, jeux et tournois', Icon: Sparkles, tone: 'text-rose-300 bg-rose-300/10' },
  { href: '/classements', label: 'Classements', detail: 'Voir les progressions', Icon: Trophy, tone: 'text-orange-300 bg-orange-300/10' },
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-10 pt-5 sm:px-6">
      <header className="mb-7 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="MHA Academy, accueil">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primaryGreen text-lg font-black text-white shadow-glow">M</span>
          <span><span className="block text-sm font-extrabold tracking-wide">MHA ACADEMY</span><span className="text-xs text-slate-400">Ton univers, ton évolution</span></span>
        </Link>
        <Link href="/auth/login" className="rounded-xl border border-neutralBorder bg-neutralCard px-4 py-2 text-sm font-semibold text-white">Connexion</Link>
      </header>

      <section className="rounded-[1.75rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-950/90 via-neutralCard to-slate-950 p-5 shadow-xl sm:p-7">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300"><Sparkles size={15} /> Espace MHA</div>
        <h1 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">Bienvenue dans ton académie.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Apprends, progresse, relève des défis et retrouve ta communauté depuis une seule application.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-primaryGreen px-4 py-3 text-sm font-bold text-white shadow-glow">Créer mon compte <ArrowUpRight size={16} /></Link>
          <Link href="/dashboard" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white">Ouvrir mon espace</Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Navigation</p><h2 className="mt-1 text-xl font-bold">Tes espaces</h2></div><span className="text-xs text-slate-500">MHA Academy</span></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {spaces.map(({ href, label, detail, Icon, tone }) => (
            <Link key={href} href={href} className="group min-h-36 rounded-2xl border border-neutralBorder bg-neutralCard/90 p-4 transition hover:border-primaryLight/60 hover:bg-neutralCard">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={20} /></span>
              <span className="mt-4 flex items-center justify-between text-sm font-bold text-white">{label}<ArrowUpRight size={14} className="text-slate-500 group-hover:text-emerald-300" /></span>
              <span className="mt-1 block text-xs leading-5 text-slate-400">{detail}</span>
            </Link>
          ))}
        </div>
      </section>
      <footer className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500"><MessageCircle size={14} /> Une application pensée pour apprendre et partager</footer>
    </main>
  );
}
