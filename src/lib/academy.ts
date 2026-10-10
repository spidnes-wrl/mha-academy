import { createSupabaseServerClient } from './supabase/server';
import { requireAdminAccess } from './permissions';

export const CLASS_OPTIONS = ['A', 'B', 'C', 'E', 'S'] as const;
export type ClassRank = (typeof CLASS_OPTIONS)[number];

export const ROLE_OPTIONS = ['student', 'teacher', 'director'] as const;
export type UserRole = (typeof ROLE_OPTIONS)[number];

export const ADMIN_ROLES: UserRole[] = ['teacher', 'director'];

export function isValidClassRank(value: string): value is ClassRank {
  return CLASS_OPTIONS.includes(value as ClassRank);
}

export function buildPrivateStudentId(index: number): string {
  const numeric = String(index + 1).padStart(3, '0');
  return `${numeric} XXX XXX`;
}

export function sanitizeMemberPayload(input: Record<string, unknown>) {
  const allowed = new Set([
    'username',
    'email',
    'first_name',
    'last_name',
    'class_rank',
    'role',
    'is_public',
    'private_id',
    'is_active',
  ]);

  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!allowed.has(key)) continue;
    cleaned[key] = value;
  }

  return cleaned;
}

export async function getAdminMembers() {
  await requireAdminAccess();
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('hma_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
