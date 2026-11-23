import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Shield, Trophy, Users } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export default async function ClanProfilePage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: clan, error } = await supabase.from('hma_clans').select('id,name,slug,description,level,total_points,verification_status,created_at').eq('slug',params.slug).eq('status','approved').maybeSingle();
  if (error || !clan) notFound();
  const [{ data: members }, { data: posts }] = await Promise.all([
    supabase.from('hma_clan_members').select('user_id,member_role,individual_points').eq('clan_id',clan.id).eq('membership_status','active').order('member_role'),
    supabase.from('hma_clan_posts').select('id,caption,image_url,created_at').eq('clan_id',clan.id).order('created_at',{ascending:false}).limit(20)
  ]);
  return <main className="mx-auto min-h-screen max-w-3xl px-4 pb-10 pt-5 sm:px-6">
    <header className="mb-7 flex items-center gap-3"><Link href="/clans" className="grid h-10 w-10 place-items-center rounded-xl border border-neutralBorder bg-neutralCard" aria-label="Retour aux clans"><ArrowLeft size={18}/></Link><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Profil public</p><h1 className="text-xl font-bold">Clan</h1></div></header>
    <section className="rounded-3xl border border-emerald-300/15 bg-gradient-to-br from-emerald-950/80 via-neutralCard to-slate-950 p-5">
      <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Shield size={28}/></span><div><h2 className="flex items-center gap-2 text-2xl font-black">{clan.name}{clan.verification_status==='verified' && <BadgeCheck size={19} className="text-sky-300"/>}</h2><p className="text-sm text-slate-400">Niveau {clan.level}</p></div></div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{clan.description || 'Aucune description pour le moment.'}</p>
      <div className="mt-5 flex gap-5 text-sm text-slate-300"><span className="flex items-center gap-2"><Trophy size={16}/> {clan.total_points} points</span><span className="flex items-center gap-2"><Users size={16}/> {members?.length ?? 0}/5 membres</span></div>
    </section>
    <section className="mt-7"><h3 className="mb-3 font-bold">Membres</h3><div className="space-y-2">{members?.map((member)=><div key={member.user_id} className="flex items-center justify-between rounded-xl border border-neutralBorder bg-neutralCard/80 p-3"><span className="text-sm">{member.member_role==='leader'?'Chef':'Membre'}</span><span className="text-xs text-slate-400">{member.individual_points} pts individuels</span></div>)}</div></section>
    <section className="mt-7"><h3 className="mb-3 font-bold">Publications</h3>{posts?.length ? <div className="space-y-3">{posts.map((post)=><article key={post.id} className="rounded-2xl border border-neutralBorder bg-neutralCard/80 p-4"><p className="whitespace-pre-wrap text-sm leading-6">{post.caption}</p>{post.image_url && <p className="mt-2 text-xs text-slate-500">Image publiée</p>}<p className="mt-3 text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString('fr-FR')}</p></article>)}</div> : <p className="rounded-xl border border-neutralBorder bg-neutralCard/70 p-4 text-sm text-slate-400">Aucune publication pour le moment.</p>}</section>
    <p className="mt-6 text-xs text-slate-500">Le profil public ne donne pas accès au chat ni aux activités réservées aux membres.</p>
  </main>;
}