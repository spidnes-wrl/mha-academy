import Link from 'next/link';
import { ArrowUpRight, BookOpen, CalendarDays, Coins, Sparkles, Trophy, Users } from 'lucide-react';

const shortcuts = [
  { href: '/missions', label: 'Missions', detail: 'Défis et récompenses', Icon: Sparkles, tone: 'text-amber-300 bg-amber-300/10' },
  { href: '/boutique', label: 'Boutique', detail: 'Découvrir les articles', Icon: Coins, tone: 'text-rose-300 bg-rose-300/10' },
  { href: '/classements', label: 'Classements', detail: 'Voir les meilleurs élèves', Icon: Trophy, tone: 'text-cyan-300 bg-cyan-300/10' },
  { href: '/bibliotheque', label: 'Bibliothèque', detail: 'Ressources et documents', Icon: BookOpen, tone: 'text-emerald-300 bg-emerald-300/10' },
  { href: '/examens', label: 'Examens', detail: 'Réviser et progresser', Icon: CalendarDays, tone: 'text-violet-300 bg-violet-300/10' },
  { href: '/messages', label: 'Messages', detail: 'Discuter avec la communauté', Icon: Users, tone: 'text-sky-300 bg-sky-300/10' },
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="MHA Academy, accueil">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 font-black text-neutralBg shadow-glow">M</span>
          <span><span className="block text-sm font-bold tracking-wide">MHA ACADEMY</span><span className="text-xs text-slate-400">Apprendre, progresser, réussir</span></span>
        </Link>
        <Link href="/auth/login" className="rounded-full border border-neutralBorder bg-neutralCard/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-primaryLight">Connexion</Link>
      </header>
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-950 via-neutralCard to-slate-950 p-6 shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-black/20 px-3 py-1.5 text-xs font-semibold text-emerald-200"><Sparkles size={14} /> TON ESPACE POUR GRANDIR</span>
        <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">Chaque jour est une nouvelle <span className="text-emerald-300">victoire.</span></h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Retrouve tes missions, tes ressources et ta communauté dans ton espace MHA Academy.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-primaryGreen px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-primaryLight">Commencer <ArrowUpRight size={17} /></Link>
          <Link href="/dashboard" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Mon espace</Link>
        </div>
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Une plateforme pensée pour les élèves et les enseignants</div>
      </section>
      <section className="mt-8" aria-labelledby="explore-title">
        <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">À explorer</p><h2 id="explore-title" className="mt-1 text-xl font-bold">Tout ton univers</h2></div><span className="text-xs text-slate-500">MHA Academy</span></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shortcuts.map(({ href, label, detail, Icon, tone }) => (
            <Link key={href} href={href} className="group rounded-2xl border border-neutralBorder bg-neutralCard/80 p-4 transition hover:-translate-y-0.5 hover:border-primaryLight/60 hover:bg-neutralCard sm:p-5">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={20} /></span>
              <span className="mt-4 flex items-center justify-between text-sm font-bold text-white">{label}<ArrowUpRight size={15} className="text-slate-500 transition group-hover:text-emerald-300" /></span>
              <span className="mt-1 block text-xs leading-5 text-slate-400">{detail}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
