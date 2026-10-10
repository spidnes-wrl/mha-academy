import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdminAccess();
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('hma_missions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ missions: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Forbidden' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    const body = await request.json();
    const title = String(body?.title ?? '').trim();
    const description = String(body?.description ?? '').trim();

    if (!title) {
      return NextResponse.json({ error: 'Mission title is required' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('hma_missions')
      .insert({
        title,
        description,
        category: body?.category ?? 'general',
        status: body?.status ?? 'active',
        reward_xp: Number(body?.reward_xp ?? 0),
        reward_coins: Number(body?.reward_coins ?? 0),
        start_date: body?.start_date ?? null,
        end_date: body?.end_date ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ mission: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Mission creation failed' }, { status: 400 });
  }
}
