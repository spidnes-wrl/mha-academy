import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function EventsAdminPage() {
  try {
    await requireAdminAccess();
    const supabase = createSupabaseServerClient();
    const { data: events } = await supabase
      .from('hma_events')
      .select('*')
      .order('event_date', { ascending: false });

    return (
      <main className="min-h-screen bg-neutralBg px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Événements</p>
              <h1 className="mt-2 text-3xl font-bold">Gestion des événements</h1>
            </div>
            <a href="/admin" className="rounded-xl border border-neutralBorder bg-neutralCard px-5 py-3 font-medium text-white hover:border-primaryLight">Panneau admin</a>
          </header>

          <div className="grid gap-4">
            {(events ?? []).map((event) => (
              <div key={event.id} className="rounded-2xl border border-neutralBorder bg-neutralCard p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{event.title}</h2>
                  <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-300">{event.status}</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{event.description}</p>
                <p className="mt-4 text-sm text-slate-400">Date: {new Date(event.event_date).toLocaleDateString('fr-FR')}</p>
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
