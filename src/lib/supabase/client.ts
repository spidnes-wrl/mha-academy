import { createBrowserClient } from '@supabase/ssr';

// Supabase project URL is public configuration. Keep a safe project-specific
// fallback so Next.js prerendering never passes an empty URL to the client.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rehwodojnkbbsolxhtih.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createBrowserSupabaseClient() {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from the deployment environment.');
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
