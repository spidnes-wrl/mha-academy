import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    redirect('/auth/login');
  }

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from('hma_profiles')
    .select('first_name, username, exam_points, xp, class_rank, virtual_coins')
    .eq('user_id', user.id)
    .single();

  const displayName = profile?.first_name || profile?.username || 'étudiant';
  const stats: [string, string][] = [
    ['Points d’examen', String(profile?.exam_points ?? 0)],
    ['XP', String(profile?.xp ?? 0)],
    ['Classe', profile?.class_rank ?? '-'],
    ['Pièces', String(profile?.virtual_coins ?? 0)],
  ];

  return (
    <main className="min-h-screen bg-neutralBg px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Tableau de bord</p>
            <h1 className="mt-2 text-3xl font-bold">Bienvenue, {displayName}</h1>
          </div>
          <Link href="/" className="button-secondary">
            Accueil
          </Link>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="card">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-4 text-3xl font-bold text-emerald-300">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
