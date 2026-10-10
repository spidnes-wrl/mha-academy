import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminPage() {
  try {
    await requireAdminAccess();
    const supabase = createSupabaseServerClient();

    const { data: members, error } = await supabase
      .from('hma_profiles')
      .select('id, username, role, class_rank, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (
      <main className="min-h-screen bg-neutralBg px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Administration</p>
              <h1 className="mt-2 text-3xl font-bold">Panneau directeur</h1>
            </div>
            <a href="/dashboard" className="rounded-xl border border-neutralBorder bg-neutralCard px-5 py-3 font-medium text-white hover:border-primaryLight">
              Dashboard
            </a>
          </header>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-sm text-slate-400">Étudiants</p>
              <p className="mt-4 text-3xl font-bold text-amber-300">{members?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-sm text-slate-400">Rôles</p>
              <p className="mt-4 text-3xl font-bold text-emerald-300">{members?.filter((m) => m.role === 'teacher').length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-sm text-slate-400">Classes</p>
              <p className="mt-4 text-3xl font-bold text-cyan-300">{new Set(members?.map((m) => m.class_rank)).size ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
              <p className="text-sm text-slate-400">Actifs</p>
              <p className="mt-4 text-3xl font-bold text-rose-300">{members?.filter((m) => m.is_active).length ?? 0}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-neutralBorder bg-neutralCard p-5">
            <h2 className="mb-4 text-xl font-semibold">Membres</h2>
            <div className="space-y-3">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-xl border border-neutralBorder bg-slate-950/50 p-3">
                  <div>
                    <p className="font-medium">{member.username}</p>
                    <p className="text-sm text-slate-400">{member.role} • {member.class_rank}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${member.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {member.is_active ? 'Actif' : 'Suspendu'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  } catch {
    redirect('/dashboard');
  }
}
