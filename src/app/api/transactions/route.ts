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

// Teachers/directors can award virtual coins to a student. Students cannot award themselves points.
export async function POST(request: Request) {
  try {
    await requireAdminAccess();

    let body: { user_id?: unknown; amount?: unknown; description?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const targetUserId = typeof body.user_id === 'string' ? body.user_id.trim() : '';
    const amount = Number(body.amount);
    const description = typeof body.description === 'string'
      ? body.description.trim().slice(0, 500)
      : 'Récompense attribuée par un membre du personnel';

    if (!targetUserId || !Number.isSafeInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: 'user_id and a positive integer amount are required' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data: student, error: profileError } = await supabase
      .from('hma_profiles')
      .select('user_id, role, virtual_coins')
      .eq('user_id', targetUserId)
      .single();

    if (profileError || !student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    if (student.role !== 'student') {
      return NextResponse.json({ error: 'Points can only be awarded to student accounts' }, { status: 400 });
    }

    const balanceBefore = Number(student.virtual_coins ?? 0);
    const balanceAfter = balanceBefore + amount;
    if (!Number.isSafeInteger(balanceAfter)) {
      return NextResponse.json({ error: 'Resulting balance is out of range' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('hma_profiles')
      .update({ virtual_coins: balanceAfter })
      .eq('user_id', targetUserId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    const { error: transactionError } = await supabase
      .from('hma_point_transactions')
      .insert({
        user_id: targetUserId,
        amount,
        transaction_type: 'admin',
        description: description || 'Récompense attribuée par un membre du personnel',
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      });

    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user_id: targetUserId,
      balanceBefore,
      balanceAfter,
      amount,
      description,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Forbidden' }, { status: 403 });
  }
}
