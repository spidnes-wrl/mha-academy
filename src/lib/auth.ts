import { createSupabaseServerClient } from './server';

export async function getCurrentUserProfile() {
  const supabase = createSupabaseServerClient();
  const { data: authUser, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser.user) {
    return null;
  }

  const { data, error } = await supabase
    .from('hma_profiles')
    .select('*')
    .eq('user_id', authUser.user.id)
    .single();

  if (error) return null;
  return data;
}

export async function isAuthorizedAdmin() {
  const profile = await getCurrentUserProfile();
  return !!profile && ['teacher', 'director'].includes(profile.role);
}
