import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-only privileged client
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Helper for demo player
const DEMO_PLAYER_USERNAME = 'demo-player';

export async function getPlayerId() {
  const { data, error } = await supabaseServer
    .from('players')
    .select('id')
    .eq('username', DEMO_PLAYER_USERNAME)
    .single();
    
  if (error || !data) return null;
  return data.id;
}

export async function getPlayerProfile() {
  const id = await getPlayerId();
  if (!id) return null;

  const { data } = await supabaseServer
    .from('players')
    .select('*')
    .eq('id', id)
    .single();
    
  return data;
}
