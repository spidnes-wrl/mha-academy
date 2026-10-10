export const CLASS_OPTIONS = ['A', 'B', 'C', 'E', 'S'] as const;
export type ClassRank = (typeof CLASS_OPTIONS)[number];

export const ROLE_OPTIONS = ['student', 'teacher', 'director'] as const;
export type UserRole = (typeof ROLE_OPTIONS)[number];

export const ADMIN_ROLES: UserRole[] = ['teacher', 'director'];

export const LEGACY_CLASS_VALUES = ['A', 'B', 'C', 'D', 'E', 'S'] as const;
