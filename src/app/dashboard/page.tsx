import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let coins = 0;
  let signedIn = true;

  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('hma_profiles')
      .select('virtual_coins')
      .eq('user_id', user.id)
      .single();
    coins = Number(data?.virtual_coins ?? 0);
  } catch {
    signedIn = false;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Tableau de bord</h1>
      {signedIn ? (
        <p>Pièces virtuelles : {coins}</p>
      ) : (
        <p>Connecte-toi pour voir ton tableau de bord.</p>
      )}
    </main>
  );
}
