import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const amount = Number(body?.amount ?? 0);
    const description = typeof body?.description === 'string' ? body.description : 'Virtual transaction';

    if (!Number.isFinite(amount) || amount === 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const { data: profile, error: profileError } = await supabase
      .from('hma_profiles')
      .select('virtual_coins')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const balanceBefore = Number(profile.virtual_coins ?? 0);
    const balanceAfter = balanceBefore + amount;

    const { error: txError } = await supabase.from('hma_point_transactions').insert({
      user_id: user.id,
      amount,
      transaction_type: amount > 0 ? 'reward' : 'refund',
      description,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
    });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('hma_profiles')
      .update({ virtual_coins: balanceAfter })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      balanceBefore,
      balanceAfter,
      amount,
      description,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}
