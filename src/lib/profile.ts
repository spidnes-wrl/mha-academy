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

const EDITABLE_PROFILE_FIELDS = ['username', 'first_name', 'last_name', 'avatar_url', 'bio', 'is_public'] as const;

export function safeProfileUpdatePayload(input: Record<string, unknown>) {
  const payload: Record<string, string | boolean | null> = {};

  for (const field of EDITABLE_PROFILE_FIELDS) {
    if (!(field in input)) continue;
    const value = input[field];

    if (field === 'is_public') {
      if (typeof value === 'boolean') payload[field] = value;
      continue;
    }

    if (value === null) {
      if (field !== 'username') payload[field] = null;
    } else if (typeof value === 'string') {
      const trimmed = value.trim().slice(0, field === 'bio' ? 500 : 100);
      if (field === 'username' && trimmed.length < 3) continue;
      payload[field] = trimmed;
    }
  }

  return payload;
}

export function normalizeVirtualBalance(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.max(0, Math.floor(amount));
}

export function normalizeExamPoints(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.max(0, Math.floor(amount));
}
