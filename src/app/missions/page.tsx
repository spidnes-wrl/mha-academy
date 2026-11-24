import { Target, Coins, Award } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Banner, Card, ChibiSticker } from '@/components/ui/AcademyUI';

export const dynamic = 'force-dynamic';

export default async function MissionsPage() {
  let data: any[] = [];
  let errorMessage = '';
  try {
    const supabase = createSupabaseServerClient();
    const result = await supabase.from('hma_missions')
      .select('id,title,description,reward_points,reward_coins,is_active,created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (result.error) errorMessage = result.error.message;
    else data = result.data || [];
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Impossible de charger les missions.';
  }

  return <main className="mha-page">
    <Banner><p className="text-xs font-semibold uppercase tracking-wider text-[#BFD2FF]">Progression</p><h1 className="mt-3 text-2xl font-bold">Missions</h1><p className="mt-2 text-sm text-[#BFD2FF]">Les défis disponibles dans ton académie.</p><ChibiSticker label="GO!"/></Banner>
    <div className="mt-8 flex items-center justify-between"><h2 className="text-lg font-bold">Missions actives</h2><span className="text-xs text-[#9AA7C2]">{data.length}</span></div>
    {errorMessage ? <Card className="mt-3 text-sm text-[#BFD2FF]">Les missions ne sont pas accessibles pour le moment. {errorMessage}</Card> : !data.length ? <Card className="mt-3 text-sm text-[#9AA7C2]">Aucune mission active pour le moment.</Card> : <div className="mt-3 space-y-3">{data.map(m => <Card key={m.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[#BFD2FF]">Mission</p><h3 className="mt-1 font-bold">{m.title}</h3></div><Target className="shrink-0 text-[#BFD2FF]" size={21}/></div><p className="mt-2 text-sm leading-6 text-[#9AA7C2]">{m.description}</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-[#BFD2FF]"><span className="inline-flex items-center gap-1"><Award size={14}/>{m.reward_points ?? 0} points</span><span className="inline-flex items-center gap-1"><Coins size={14}/>{m.reward_coins ?? 0} pièces</span></div></Card>)}</div>}
  </main>;
}
