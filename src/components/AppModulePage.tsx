import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react';

export default function AppModulePage({ title, description, items }: { title: string; description: string; items: string[] }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-10 pt-5 sm:px-6">
      <header className="mb-7 flex items-center gap-3">
        <Link href="/" aria-label="Retour à l'accueil" className="grid h-10 w-10 place-items-center rounded-xl border border-neutralBorder bg-neutralCard text-white transition hover:border-[#f4b879]"><ArrowLeft size={18}/></Link>
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">MHA Academy</p><h1 className="text-xl font-bold">{title}</h1></div>
      </header>
      <section className="mha-glass relative isolate overflow-hidden rounded-3xl p-5">
        <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 -z-10 text-8xl opacity-[.07]">✦</span>
        <span className="mha-sticker"><Sparkles size={12}/> ESPACE MHA</span>
        <h2 className="mt-4 text-2xl font-black">{title}</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-300">{description}</p>
      </section>
      <section className="mt-6 space-y-3">{items.map((item,index)=><div key={item} className="flex items-center justify-between rounded-2xl border border-neutralBorder bg-neutralCard p-4 transition hover:border-white/20"><div className="flex items-center gap-3"><span className="mha-badge grid h-9 w-9 place-items-center rounded-xl text-sm font-bold">{String(index+1).padStart(2,'0')}</span><span className="text-sm font-semibold">{item}</span></div><ArrowUpRight size={16} className="text-[#f4b879]"/></div>)}</section>
      <p className="mt-6 text-center text-xs text-neutral-500">Les modules seront activés progressivement dans l'application.</p>
    </main>
  );
}
