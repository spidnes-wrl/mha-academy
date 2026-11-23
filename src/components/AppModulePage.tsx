import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Banner, Card, ChibiSticker } from '@/components/ui/AcademyUI';

export default function AppModulePage({ title, description, items }: { title: string; description: string; items: string[] }) {
  return <main className="mha-page">
    <header className="mb-6 flex items-center gap-3">
      <Link href="/" aria-label="Retour à l'accueil" className="grid h-11 w-11 place-items-center rounded-xl border border-[#1B2437] bg-[#0A0D14] text-white"><ArrowLeft size={19} strokeWidth={1.6}/></Link>
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#BFD2FF]">MHA Academy</p><h1 className="text-xl font-bold">{title}</h1></div>
    </header>
    <Banner className="min-h-[180px]">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#BFD2FF]">Espace MHA</p>
      <h2 className="mt-3 text-2xl font-bold">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#BFD2FF]">{description}</p>
      <ChibiSticker label="MHA"/>
    </Banner>
    <section className="mt-8 space-y-3">{items.map((item,index)=><Card key={item} className="flex items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><span className="mha-badge grid h-10 w-10 place-items-center rounded-xl text-sm font-bold">{String(index+1).padStart(2,'0')}</span><span className="text-sm font-semibold">{item}</span></div><ArrowUpRight size={17} className="shrink-0 text-[#BFD2FF]" strokeWidth={1.6}/></Card>)}</section>
  </main>;
}
