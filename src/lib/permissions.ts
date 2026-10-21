import { createSupabaseServerClient } from './supabase/server';

export type Role = 'student' | 'teacher' | 'director';
export type ClassRank = 'A' | 'B' | 'C' | 'E' | 'S';

export const CLASS_OPTIONS: ClassRank[] = ['A', 'B', 'C', 'E', 'S'];
export const ROLE_OPTIONS: Role[] = ['student', 'teacher', 'director'];
export const ADMIN_ROLES: Role[] = ['teacher', 'director'];

export function isValidClassRank(value: string): value is ClassRank {
  return CLASS_OPTIONS.includes(value as ClassRank);
}

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as Role);
}

export async function requireAuthenticatedUser() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Unauthorized');
  }

  return data.user;
}

export async function requireAdminAccess() {
  const user = await requireAuthenticatedUser();
  const supabase = createSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from('hma_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !profile || !isAdminRole(profile.role)) {
    throw new Error('Forbidden');
  }

  return profile;
}
