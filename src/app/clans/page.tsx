import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BadgeCheck, Shield, Trophy, Users } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
type Clan = { id: string; name: string; slug: string; description: string; level: number; total_points: number; verification_status: string };
export default async function ClansPage() {
  let clans: Clan[] = [];
  let unavailable = false;
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('hma_clans').select('id,name,slug,description,level,total_points,verification_status').eq('status','approved').order('total_points',{ascending:false});
    if (error) unavailable = true; else clans = (data ?? []) as Clan[];
  } catch { unavailable = true; }
  return <main className="mx-auto min-h-screen max-w-3xl px-4 pb-10 pt-5 sm:px-6">
    <header className="mb-7 flex items-center gap-3"><Link href="/" className="grid h-10 w-10 place-items-center rounded-xl border border-neutralBorder bg-neutralCard" aria-label="Retour"><ArrowLeft size={18}/></Link><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Communauté</p><h1 className="text-xl font-bold">Les clans</h1></div></header>
    <section className="rounded-3xl border border-emerald-300/15 bg-gradient-to-br from-emerald-950/80 via-neutralCard to-slate-950 p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300"><Shield size={15}/> Organisation collective</div>
      <h2 className="mt-3 text-2xl font-black">Trouve ton clan.</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">Les clans réunissent cinq membres au maximum autour de défis, de tournois, de quiz et d'activités collectives.</p>
    </section>
    <div className="mb-3 mt-7 flex items-center justify-between"><h2 className="font-bold">Clans approuvés</h2><span className="text-xs text-slate-500">{clans.length} clan(s)</span></div>
    {unavailable ? <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">Le module des clans attend l'application des migrations Supabase 004 à 006. Les autres espaces de l'application restent disponibles.</div> : clans.length === 0 ? <div className="rounded-2xl border border-neutralBorder bg-neutralCard/80 p-6 text-center"><Shield size={28} className="mx-auto text-slate-500"/><p className="mt-3 font-semibold">Aucun clan approuvé pour le moment</p><p className="mt-1 text-sm text-slate-400">Les premiers clans apparaîtront ici après validation administrative.</p></div> : <div className="space-y-3">
      {clans.map((clan)=><Link key={clan.id} href={`/clans/${clan.slug}`} className="block rounded-2xl border border-neutralBorder bg-neutralCard/90 p-4 transition hover:border-primaryLight/60">
        <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Shield size={22}/></span><div className="min-w-0"><p className="flex items-center gap-1 font-bold">{clan.name}{clan.verification_status==='verified' && <BadgeCheck size={16} className="text-sky-300"/>}</p><p className="mt-1 line-clamp-2 text-xs text-slate-400">{clan.description || 'Aucune description pour le moment.'}</p></div></div><ArrowUpRight size={17} className="shrink-0 text-slate-500"/></div>
        <div className="mt-4 flex gap-4 text-xs text-slate-400"><span className="flex items-center gap-1"><Trophy size={14}/> {clan.total_points} pts</span><span className="flex items-center gap-1"><Users size={14}/> Niveau {clan.level}</span></div>
      </Link>)}
    </div>}
  </main>;
}