import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();

    const { data: profile, error: profileError } = await supabase
      .from('hma_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: missions, error: missionsError } = await supabase
      .from('hma_missions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: events, error: eventsError } = await supabase
      .from('hma_events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: false })
      .limit(5);

    const { data: transactions, error: txError } = await supabase
      .from('hma_point_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (profileError || missionsError || eventsError || txError) {
      throw new Error('Database query failed');
    }

    return NextResponse.json(
      {
        profile,
        missions: missions ?? [],
        events: events ?? [],
        recentTransactions: transactions ?? [],
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}
