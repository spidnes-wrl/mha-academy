import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();

    const { data: currentProfile, error: currentProfileError } = await supabase
      .from('hma_profiles')
      .select('id, user_id, username, xp, class_rank')
      .eq('user_id', user.id)
      .single();

    if (currentProfileError || !currentProfile) {
      return NextResponse.json({ matches: [] }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('hma_matches')
      .select('*')
      .or(`player1_id.eq.${currentProfile.id},player2_id.eq.${currentProfile.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ matches: data ?? [], profile: currentProfile }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const supabase = createSupabaseServerClient();

    const { data: currentProfile, error: currentProfileError } = await supabase
      .from('hma_profiles')
      .select('id, user_id, username')
      .eq('user_id', user.id)
      .single();

    if (currentProfileError || !currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const opponentId = typeof body?.opponent_id === 'string' ? body.opponent_id : null;

    let opponentProfile = null as { id: string; user_id: string; username: string } | null;

    if (opponentId) {
      const { data: profile, error: opponentError } = await supabase
        .from('hma_profiles')
        .select('id, user_id, username')
        .eq('id', opponentId)
        .single();

      if (opponentError || !profile) {
        return NextResponse.json({ error: 'Opponent not found' }, { status: 404 });
      }
      opponentProfile = profile;
    } else {
      const { data: list, error: listError } = await supabase
        .from('hma_profiles')
        .select('id, user_id, username')
        .neq('user_id', user.id)
        .order('xp', { ascending: false })
        .limit(1);

      if (listError || !list || list.length === 0) {
        return NextResponse.json({ error: 'No opponent available' }, { status: 404 });
      }
      opponentProfile = list[0];
    }

    const { data, error } = await supabase
      .from('hma_matches')
      .insert({
        player1_id: currentProfile.id,
        player2_id: opponentProfile.id,
        status: 'pending',
        bet_amount: Number(body?.bet_amount ?? 0),
        started_at: new Date().toISOString(),
        pgn: body?.pgn ?? '1. e4 e5',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ match: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Match creation failed' }, { status: 400 });
  }
}
