import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { safeProfileUpdatePayload } from '@/lib/profile';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();

    const { data: profile, error } = await supabase
      .from('hma_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const publicProfile = {
      id: profile.id,
      username: profile.username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      class_rank: profile.class_rank,
      role: profile.role,
      exam_points: profile.exam_points,
      xp: profile.xp,
      virtual_coins: profile.virtual_coins,
      is_public: profile.is_public,
      created_at: profile.created_at,
    };

    return NextResponse.json({ profile: publicProfile }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const payload = safeProfileUpdatePayload(body ?? {});
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('hma_profiles')
      .update(payload)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Profile update failed' }, { status: 400 });
    }

    return NextResponse.json({ profile: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Profile update failed' }, { status: 400 });
  }
}
