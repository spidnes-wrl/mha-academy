import { redirect } from 'next/navigation';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();

    const { data: profile, error } = await supabase
      .from('hma_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !profile) {
      redirect('/auth/login');
    }

    return (
      <main className="min-h-screen bg-neutralBg px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Tableau de bord</p>
              <h1 className="mt-2 text-3xl font-bold">Bienvenue, {profile.first_name ?? 'étudiant'}</h1>
            </div>
            <a href="/" className="rounded-xl border border-neutralBorder bg-neutralCard px-5 py-3 font-medium text-white hover:border-primaryLight">
              Accueil
            </a>
          </header>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-sm text-slate-400">Points d’examen</p>
              <p className="mt-4 text-3xl font-bold text-emerald-300">{profile.exam_points}</p>
            </div>
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-sm text-slate-400">XP</p>
              <p className="mt-4 text-3xl font-bold text-cyan-300">{profile.xp}</p>
            </div>
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-sm text-slate-400">Classe</p>
              <p className="mt-4 text-3xl font-bold text-amber-300">{profile.class_rank}</p>
            </div>
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-sm text-slate-400">Pièces</p>
              <p className="mt-4 text-3xl font-bold text-rose-300">{profile.virtual_coins}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-lg font-semibold">Profil</p>
              <p className="mt-2 text-sm text-slate-400">{profile.username}</p>
            </div>
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-lg font-semibold">Missions</p>
              <p className="mt-2 text-sm text-slate-400">Accès sécurisé et contrôlé côté serveur.</p>
            </div>
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-lg font-semibold">Événements</p>
              <p className="mt-2 text-sm text-slate-400">Consultation des événements publiés.</p>
            </div>
          </div>
        </div>
      </main>
    );
  } catch {
    redirect('/auth/login');
  }
}
