import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentsAdminPage() {
  try {
    await requireAdminAccess();
    const supabase = createSupabaseServerClient();
    const { data: members } = await supabase
      .from('hma_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return (
      <main className="min-h-screen bg-neutralBg px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Étudiants</p>
              <h1 className="mt-2 text-3xl font-bold">Gestion des étudiants</h1>
            </div>
            <a href="/admin" className="rounded-xl border border-neutralBorder bg-neutralCard px-5 py-3 font-medium text-white hover:border-primaryLight">Panneau admin</a>
          </header>

          <div className="space-y-3">
            {(members ?? []).map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-2xl border border-neutralBorder bg-neutralCard p-4">
                <div>
                  <p className="font-semibold">{member.username}</p>
                  <p className="text-sm text-slate-400">{member.first_name} {member.last_name} • {member.class_rank} • {member.role}</p>
                </div>
                <div className="text-right text-sm text-slate-300">
                  <p>XP: {member.xp}</p>
                  <p>Points: {member.exam_points}</p>
                  <p>Pièces: {member.virtual_coins}</p>
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
