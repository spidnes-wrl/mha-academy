import { createBrowserClient } from '@supabase/ssr';

const FALLBACK_SUPABASE_URL = 'https://rehwodojnkbbsolxhtih.supabase.co';

function getSupabaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (configuredUrl) {
    try {
      const parsed = new URL(configuredUrl);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.toString().replace(/\/$/, '');
      }
    } catch {
      // Fall back to the known MHA project URL when Vercel has an invalid value.
    }
  }

  return FALLBACK_SUPABASE_URL;
}

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

export function createBrowserSupabaseClient() {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from the deployment environment.');
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
