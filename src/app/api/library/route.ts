import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();

    const { data: profile } = await supabase
      .from('hma_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    let query = supabase.from('hma_documents').select('*').eq('access_level', 'public');

    if (profile?.role === 'teacher' || profile?.role === 'director') {
      query = query.or('access_level.eq.private');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ documents: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}
