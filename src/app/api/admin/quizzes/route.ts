import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();

    const { data: profile, error: profileError } = await supabase
      .from('hma_profiles')
      .select('virtual_coins')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabase
      .from('hma_shop_items')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    return NextResponse.json({
      balance: profile.virtual_coins,
      items: items ?? [],
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const itemId = String(body?.item_id ?? '');
    const quantity = Number(body?.quantity ?? 1);

    if (!itemId || !Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Invalid purchase payload' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const { data: item, error: itemError } = await supabase
      .from('hma_shop_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item || !item.is_available) {
      return NextResponse.json({ error: 'Item unavailable' }, { status: 404 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('hma_profiles')
      .select('virtual_coins')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const totalCost = Number(item.price ?? 0) * quantity;
    const currentBalance = Number(profile.virtual_coins ?? 0);

    if (currentBalance < totalCost) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
    }

    const { error: txError } = await supabase
      .from('hma_point_transactions')
      .insert({
        user_id: user.id,
        amount: -totalCost,
        transaction_type: 'purchase',
        description: `Purchase: ${item.name}`,
        balance_before: currentBalance,
        balance_after: currentBalance - totalCost,
      });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 });
    }

    const { error: orderError } = await supabase
      .from('hma_shop_orders')
      .insert({
        user_id: user.id,
        item_id: item.id,
        quantity,
        total_price: totalCost,
        status: 'completed',
      });

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('hma_profiles')
      .update({ virtual_coins: currentBalance - totalCost })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, remainingBalance: currentBalance - totalCost }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Purchase failed' }, { status: 400 });
  }
}
