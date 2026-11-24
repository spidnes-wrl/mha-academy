import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, LogIn, ShoppingBag, Target, Users } from 'lucide-react';
import { Banner, Card, ChibiSticker } from '@/components/ui/AcademyUI';

const destinations = [
  { href: '/academie', title: 'Académie', description: 'Découvre le parcours et les activités scolaires.', Icon: GraduationCap },
  { href: '/missions', title: 'Missions', description: 'Retrouve les défis et objectifs de progression.', Icon: Target },
  { href: '/bibliotheque', title: 'Bibliothèque', description: 'Accède aux ressources et documents publiés.', Icon: BookOpen },
  { href: '/boutique', title: 'Boutique', description: 'Explore les articles de l’académie.', Icon: ShoppingBag },
  { href: '/communaute', title: 'Communauté', description: 'Retrouve les publications des membres.', Icon: Users },
];

export default function HomePage() {
  return <main className="mha-page">
    <header className="mb-6 flex items-center justify-between gap-3">
      <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="MHA Academy, accueil">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-blue-500/40 bg-blue-600 text-lg font-black text-white">M</span>
        <span className="min-w-0"><span className="block text-sm font-bold tracking-wide">MHA ACADEMY</span><span className="block text-xs text-[#9AA7C2]">Ton académie, ton univers</span></span>
      </Link>
      <Link href="/auth/login" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[#1B2437] bg-[#0A0D14] px-3 text-sm font-semibold text-[#BFD2FF]"><LogIn size={17}/> Connexion</Link>
    </header>
    <Banner className="min-h-[250px] overflow-visible p-6 sm:p-8">
      <div className="relative z-10 max-w-[28rem]">
        <span className="mha-sticker">BIENVENUE À MHA</span>
        <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">Apprendre, jouer et évoluer ensemble.</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#BFD2FF]">Une académie en ligne où les étudiants avancent, relèvent des missions et partagent leur passion.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/auth/register" className="button-primary">Créer un compte <ArrowRight size={17}/></Link>
          <Link href="/auth/login" className="button-secondary">Se connecter</Link>
        </div>
      </div>
      <ChibiSticker label="MHA"/>
    </Banner>
    <section className="mt-9">
      <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#9AA7C2]">Explorer</p><h2 className="mt-1 text-xl font-bold">Découvrir l’académie</h2></div><span className="text-xs text-[#9AA7C2]">Accès rapide</span></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {destinations.map(({href,title,description,Icon}) => <Link key={href} href={href} className="group block min-h-[116px] rounded-[20px] border border-[#1B2437] bg-[#0A0D14] p-4 transition-colors hover:border-blue-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400">
          <div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600/15 text-[#BFD2FF]"><Icon size={21} strokeWidth={1.7}/></span><ArrowRight size={18} className="text-[#9AA7C2] transition-transform group-hover:translate-x-1"/></div>
          <h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-[#9AA7C2]">{description}</p>
        </Link>)}
      </div>
    </section>
    <Card className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="font-semibold">Déjà membre de MHA Academy ?</h2><p className="mt-1 text-sm text-[#9AA7C2]">Connecte-toi pour retrouver ton profil, tes messages et ta progression.</p></div>
      <Link href="/auth/login" className="button-primary shrink-0">Accéder à mon espace <ArrowRight size={16}/></Link>
    </Card>
    <p className="mt-6 pb-4 text-center text-xs text-[#65718A]">MHA Academy · Ton aventure commence ici.</p>
  </main>;
}