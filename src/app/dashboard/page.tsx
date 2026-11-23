import Link from 'next/link';
import { Coins, Target, Award, BookOpen, Shield, Gamepad2, ArrowUpRight } from 'lucide-react';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AvatarFrame, Banner, ChibiSticker, Card } from '@/components/ui/AcademyUI';
import ProfileEditor from '@/components/ProfileEditor';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let profile: any = null;
  let missionCount = 0;
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();
    const [{ data }, { count }] = await Promise.all([
      supabase.from('hma_profiles').select('username,first_name,last_name,avatar_url,bio,class_rank,xp,exam_points,virtual_coins').eq('user_id', user.id).single(),
      supabase.from('hma_missions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);
    profile = data;
    missionCount = count ?? 0;
  } catch {
    return <main className="mha-page"><Banner><p className="text-xs font-semibold uppercase tracking-widest text-[#BFD2FF]">MHA Academy</p><h1 className="mt-3 text-2xl font-bold">Ton profil t’attend.</h1><p className="mt-2 text-sm text-[#BFD2FF]">Connecte-toi pour retrouver ta progression.</p></Banner><Link href="/auth/login" className="button-primary mt-8">Se connecter</Link></main>;
  }

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username || 'Étudiant MHA';
  const xp = Number(profile?.xp ?? 0);
  return <main className="mha-page">
    <Banner className="min-h-[205px] pb-8">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#BFD2FF]">Profil étudiant</p>
      <h1 className="mt-3 max-w-xs text-2xl font-bold">{displayName}</h1>
      <p className="mt-2 text-sm text-[#BFD2FF]">Classe {profile?.class_rank || '—'} · MHA Academy</p>
      <ChibiSticker label="MHA" />
    </Banner>
    <div className="-mt-5 relative z-10 flex items-end gap-3 px-4">
      <AvatarFrame src={profile?.avatar_url} name={displayName} size="h-20 w-20"/>
      <div className="pb-2"><p className="text-sm font-bold">{profile?.username ? '@'+profile.username : displayName}</p><p className="text-xs text-[#9AA7C2]">Étudiant MHA</p></div>
    </div>
    <div className="mt-4 flex justify-end"><ProfileEditor firstName={profile?.first_name ?? ''} lastName={profile?.last_name ?? ''} bio={profile?.bio ?? ''} avatarUrl={profile?.avatar_url ?? ''}/></div>
    <Card className="mt-5">
      <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#9AA7C2]">Expérience</p><p className="mt-1 text-2xl font-bold text-[#BFD2FF]">{xp.toLocaleString('fr-FR')} XP</p></div><Award className="text-blue-400" size={24} strokeWidth={1.6}/></div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1B2437]"><div className="h-full w-full rounded-full bg-gradient-to-r from-blue-700 to-blue-400"/></div>
      <p className="mt-2 text-xs text-[#9AA7C2]">XP accumulée</p>
    </Card>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Card><Coins size={20} className="text-[#BFD2FF]" strokeWidth={1.6}/><p className="mt-3 text-xl font-bold">{Number(profile?.virtual_coins ?? 0).toLocaleString('fr-FR')}</p><p className="text-xs text-[#9AA7C2]">Pièces</p></Card>
      <Card><Target size={20} className="text-[#BFD2FF]" strokeWidth={1.6}/><p className="mt-3 text-xl font-bold">{missionCount}</p><p className="text-xs text-[#9AA7C2]">Missions actives</p></Card>
    </div>
    <Card className="mt-4"><div className="flex items-center justify-between"><div><p className="font-semibold">Points d’évaluation</p><p className="mt-1 text-xs text-[#9AA7C2]">Résultats académiques</p></div><p className="text-xl font-bold text-[#BFD2FF]">{Number(profile?.exam_points ?? 0).toLocaleString('fr-FR')}</p></div></Card>
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-bold">Tes espaces</h2>
      <div className="grid grid-cols-2 gap-3">
        {[{href:'/academie',label:'Académie',Icon:BookOpen},{href:'/clans',label:'Mes clans',Icon:Shield},{href:'/jeux',label:'Espace jeux',Icon:Gamepad2},{href:'/communaute',label:'Communauté',Icon:ArrowUpRight}].map(({href,label,Icon})=><Link key={href} href={href} className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#1B2437] bg-[#0A0D14] p-4 text-sm font-semibold hover:border-blue-500/60"><Icon size={19} className="text-[#BFD2FF]" strokeWidth={1.6}/>{label}</Link>)}
      </div>
    </section>
  </main>;
}
