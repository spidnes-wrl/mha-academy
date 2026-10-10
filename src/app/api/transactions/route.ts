import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdminAccess();
    const supabase = createSupabaseServerClient();

    const { data: members, error } = await supabase
      .from('hma_profiles')
      .select('id, role');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const totalMembers = members?.length ?? 0;
    const totalTeachers = members?.filter((item) => item.role === 'teacher').length ?? 0;
    const totalDirectors = members?.filter((item) => item.role === 'director').length ?? 0;

    return NextResponse.json({
      totalMembers,
      totalTeachers,
      totalDirectors,
      generatedAt: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Forbidden' }, { status: 403 });
  }
}
