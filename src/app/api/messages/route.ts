import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { canMessageUser, validateMessagePayload } from '@/lib/messaging';

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const conversationUserId = searchParams.get('user_id');
    const supabase = createSupabaseServerClient();

    let query = supabase
      .from('hma_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (conversationUserId) {
      query = query.or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${conversationUserId}),and(sender_id.eq.${conversationUserId},receiver_id.eq.${user.id})`,
      );
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ messages: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const payload = validateMessagePayload(body ?? {});

    if (!(await canMessageUser(payload.receiver_id))) {
      return NextResponse.json({ error: 'User is blocked' }, { status: 403 });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('hma_messages')
      .insert({
        sender_id: user.id,
        receiver_id: payload.receiver_id,
        content: payload.content,
        message_type: payload.message_type,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Message failed' }, { status: 400 });
  }
}
