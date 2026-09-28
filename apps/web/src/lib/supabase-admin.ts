import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@pobo/db-types';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — copy .env.example to .env.local.');
}

// Bypasses RLS — only ever import this from /admin server code, never from
// anything that could end up in a Client Component bundle. `server-only`
// above makes that a build error if it happens by mistake.
export const supabaseAdmin = createClient<Database>(url, serviceRoleKey);
