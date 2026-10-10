export function sanitizePublicProfile<T extends Record<string, unknown>>(profile: T) {
  const publicFields = [
    'id',
    'username',
    'first_name',
    'last_name',
    'avatar_url',
    'bio',
    'class_rank',
    'is_public',
    'created_at',
  ];

  return Object.fromEntries(
    Object.entries(profile).filter(([key]) => publicFields.includes(key)),
  ) as Partial<T>;
}

export function normalizeVirtualBalance(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.max(0, Math.floor(amount));
}

export function normalizeExamPoints(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.max(0, Math.floor(amount));
}
