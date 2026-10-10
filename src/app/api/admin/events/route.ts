import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdminAccess();
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('hma_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ events: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Forbidden' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    const body = await request.json();
    const title = String(body?.title ?? '').trim();

    if (!title || !body?.event_date) {
      return NextResponse.json({ error: 'title and event_date are required' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('hma_events')
      .insert({
        title,
        description: body?.description ?? '',
        event_date: body.event_date,
        banner_url: body?.banner_url ?? null,
        status: body?.status ?? 'draft',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Event creation failed' }, { status: 400 });
  }
}
