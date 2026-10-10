import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthenticatedUser } from '@/lib/permissions';

export async function getCurrentUserProfile() {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('hma_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getUserById(userId: string) {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('hma_profiles')
      .select('id, username, first_name, last_name, avatar_url, class_rank, is_public')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getPublicProfile(profileId: string) {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('hma_profiles')
      .select('id, username, first_name, last_name, avatar_url, class_rank, created_at')
      .eq('id', profileId)
      .eq('is_public', true)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
