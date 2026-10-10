import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthenticatedUser } from '@/lib/permissions';

export type MessageType = 'text' | 'image' | 'file';

export function validateMessagePayload(payload: Record<string, unknown>) {
  const content = typeof payload?.content === 'string' ? payload.content.trim() : '';
  const receiverId = typeof payload?.receiver_id === 'string' ? payload.receiver_id : null;
  const messageType = typeof payload?.message_type === 'string' ? payload.message_type : 'text';

  if (!receiverId) throw new Error('receiver_id is required');
  if (!content && messageType === 'text') throw new Error('message content is required');
  if (!['text', 'image', 'file'].includes(messageType)) throw new Error('invalid message_type');

  return {
    receiver_id: receiverId,
    content,
    message_type: messageType as MessageType,
  };
}

export async function canMessageUser(targetUserId: string) {
  const user = await requireAuthenticatedUser();
  const supabase = createSupabaseServerClient();

  const { data: block, error } = await supabase
    .from('hma_user_blocks')
    .select('id')
    .eq('user_id', user.id)
    .eq('blocked_user_id', targetUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !block;
}
