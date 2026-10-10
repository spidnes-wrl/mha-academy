import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export function getSupabaseClient(context: 'browser' | 'server' | 'admin') {
  switch (context) {
    case 'browser':
      return createSupabaseBrowserClient();
    case 'server':
      return createSupabaseServerClient();
    case 'admin':
      return createSupabaseAdminClient();
    default:
      throw new Error('Invalid context');
  }
}
