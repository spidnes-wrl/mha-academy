import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react';
export default function AppModulePage({ title, description, items }: { title: string; description: string; items: string[] }) {
  return <main className="mx-auto min-h-screen max-w-3xl px-4 pb-10 pt-5 sm:px-6">
    <header className="mb-7 flex items-center gap-3"><Link href="/" aria-label="Retour à l'accueil" className="grid h-10 w-10 place-items-center rounded-xl border border-neutralBorder bg-neutralCard"><ArrowLeft size={18}/></Link><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">MHA Academy</p><h1 className="text-xl font-bold">{title}</h1></div></header>
    <section className="rounded-3xl border border-emerald-300/15 bg-gradient-to-br from-emerald-950/80 via-neutralCard to-slate-950 p-5">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300"><Sparkles size={14}/> Espace application</span>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </section>
    <section className="mt-6 space-y-3">{items.map((item,index)=><div key={item} className="flex items-center justify-between rounded-2xl border border-neutralBorder bg-neutralCard/80 p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/10 text-sm font-bold text-emerald-300">{index+1}</span><span className="text-sm font-semibold">{item}</span></div><ArrowUpRight size={16} className="text-slate-500"/></div>)}</section>
    <p className="mt-6 text-center text-xs text-slate-500">Les modules seront activés progressivement dans l'application.</p>
  </main>;
}