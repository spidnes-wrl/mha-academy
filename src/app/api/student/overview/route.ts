import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();

    const { data: profile, error: profileError } = await supabase
      .from('hma_profiles')
      .select('username, class_rank, role, xp, exam_points, virtual_coins')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: events, error: eventsError } = await supabase
      .from('hma_events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: false });

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 400 });
    }

    return NextResponse.json({
      profile,
      events: events ?? [],
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}
