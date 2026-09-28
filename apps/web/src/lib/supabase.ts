import { createClient } from '@supabase/supabase-js';
import type { Database } from '@pobo/db-types';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing SUPABASE_URL / SUPABASE_ANON_KEY — copy .env.example to .env.local.');
}

// Server-only, anon-key client for public read-only pages (share links).
// No auth/session handling needed here — see apps/mobile for the signed-in app.
export const supabase = createClient<Database>(url, anonKey);
