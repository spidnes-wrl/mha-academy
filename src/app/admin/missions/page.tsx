import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function MissionsAdminPage() {
  try {
    await requireAdminAccess();
    const supabase = createSupabaseServerClient();
    const { data: missions } = await supabase
      .from('hma_missions')
      .select('*')
      .order('created_at', { ascending: false });

    return (
      <main className="min-h-screen bg-neutralBg px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Missions</p>
              <h1 className="mt-2 text-3xl font-bold">Gestion des missions</h1>
            </div>
            <a href="/admin" className="rounded-xl border border-neutralBorder bg-neutralCard px-5 py-3 font-medium text-white hover:border-primaryLight">Panneau admin</a>
          </header>

          <div className="grid gap-4">
            {(missions ?? []).map((mission) => (
              <div key={mission.id} className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{mission.title}</h2>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">{mission.status}</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{mission.description}</p>
                <div className="mt-4 flex gap-6 text-sm text-slate-400">
                  <span>Catégorie: {mission.category}</span>
                  <span>XP: {mission.reward_xp}</span>
                  <span>Pièces: {mission.reward_coins}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  } catch {
    redirect('/dashboard');
  }
}
