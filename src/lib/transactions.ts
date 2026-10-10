export function validateProfileMutation(input: Record<string, unknown>) {
  const allowedFields = new Set([
    'username',
    'first_name',
    'last_name',
    'avatar_url',
    'bio',
    'is_public',
    'class_rank',
  ]);

  const blockedFields = ['role', 'exam_points', 'xp', 'virtual_coins'];

  for (const key of Object.keys(input)) {
    if (blockedFields.includes(key)) {
      throw new Error(`Field '${key}' is protected and cannot be modified by the user`);
    }

    if (!allowedFields.has(key)) {
      throw new Error(`Field '${key}' is not allowed`);
    }
  }
}

export function safeProfileUpdatePayload(input: Record<string, unknown>) {
  validateProfileMutation(input);
  return input;
}
