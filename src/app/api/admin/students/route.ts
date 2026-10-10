import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeMemberPayload, isValidClassRank } from '@/lib/academy';

export async function GET() {
  try {
    await requireAdminAccess();
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('hma_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ members: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Forbidden' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    const body = await request.json();
    const cleaned = sanitizeMemberPayload(body ?? {});

    if (!cleaned.username || !cleaned.email) {
      return NextResponse.json({ error: 'username and email are required' }, { status: 400 });
    }

    if (cleaned.class_rank && !isValidClassRank(String(cleaned.class_rank))) {
      return NextResponse.json({ error: 'Invalid class_rank. Allowed: A, B, C, E, S' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const record = {
      ...cleaned,
      user_id: cleaned.user_id ?? null,
      role: cleaned.role ?? 'student',
      class_rank: cleaned.class_rank ?? 'A',
      is_public: cleaned.is_public ?? true,
      is_active: cleaned.is_active ?? true,
      private_id: cleaned.private_id ?? null,
      exam_points: 0,
      xp: 0,
      virtual_coins: 0,
    };

    const { data, error } = await supabase
      .from('hma_profiles')
      .insert(record)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ member: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create member' }, { status: 400 });
  }
}
