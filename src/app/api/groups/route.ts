import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('hma_groups')
      .select('*')
      .or(`owner_id.eq.${user.id},id.in.(select group_id from hma_group_members where user_id = ${user.id})`)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ groups: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const name = String(body?.name ?? '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data: group, error: groupError } = await supabase
      .from('hma_groups')
      .insert({
        name,
        description: body?.description ?? '',
        owner_id: user.id,
        is_private: body?.is_private ?? false,
      })
      .select()
      .single();

    if (groupError || !group) {
      return NextResponse.json({ error: groupError?.message ?? 'Group creation failed' }, { status: 400 });
    }

    const { error: memberError } = await supabase.from('hma_group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Group creation failed' }, { status: 400 });
  }
}
