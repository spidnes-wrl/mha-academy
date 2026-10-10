import { createSupabaseServerClient } from './supabase/server';

export type Role = 'student' | 'teacher' | 'director';
export type ClassRank = 'A' | 'B' | 'C' | 'E' | 'S';

export const CLASS_OPTIONS: ClassRank[] = ['A', 'B', 'C', 'E', 'S'];
export const ROLE_OPTIONS: Role[] = ['student', 'teacher', 'director'];

export async function requireAuthUser() {
  const supabase = createSupabaseServerClient();
  const { data: authUser, error } = await supabase.auth.getUser();

  if (error || !authUser.user) {
    throw new Error('Unauthorized');
  }

  return authUser.user;
}

export async function requireAdminAccess() {
  const user = await requireAuthUser();
  const supabase = createSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from('hma_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !profile || !['teacher', 'director'].includes(profile.role)) {
    throw new Error('Forbidden');
  }

  return profile;
}
