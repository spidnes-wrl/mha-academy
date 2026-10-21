import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdminAccess();
    const supabase = createSupabaseServerClient();

    const { data: members, error: memberError } = await supabase
      .from('hma_profiles')
      .select('id, user_id, username, email, class_rank, role');

    const { data: missions, error: missionsError } = await supabase
      .from('hma_missions')
      .select('id, status');

    const { data: events, error: eventsError } = await supabase
      .from('hma_events')
      .select('id, status');

    const { data: transactions, error: transactionsError } = await supabase
      .from('hma_point_transactions')
      .select('id');

    if (memberError || missionsError || eventsError || transactionsError) {
      throw new Error('Database query failed');
    }

    const totalMembers = members?.length ?? 0;
    const totalStudents = members?.filter((m) => m.role === 'student').length ?? 0;
    const totalMissions = missions?.length ?? 0;
    const totalEvents = events?.length ?? 0;
    const totalTransactions = transactions?.length ?? 0;

    return NextResponse.json(
      {
        stats: {
          totalMembers,
          totalStudents,
          totalTeachers: totalMembers - totalStudents - (members?.filter((m) => m.role === 'director').length ?? 0),
          totalDirectors: members?.filter((m) => m.role === 'director').length ?? 0,
          totalMissions,
          activeMissions: missions?.filter((m) => m.status === 'active').length ?? 0,
          totalEvents,
          publishedEvents: events?.filter((e) => e.status === 'published').length ?? 0,
          totalTransactions,
        },
        generatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Forbidden' }, { status: 403 });
  }
}
