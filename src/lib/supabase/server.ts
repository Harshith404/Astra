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

export async function ensureDemoData(playerId: string) {
  // Ensure missions exist
  await supabaseServer.from('missions').upsert([
    { id: 'level-1', name: 'OUTPOST DELTA', description: 'Mining / Habitat Outpost', difficulty: 'NORMAL', timer_seconds: 120, total_colonists: 8, mission_order: 1 },
    { id: 'level-2', name: 'HELIOS LAB', description: 'Research Facility', difficulty: 'HARD', timer_seconds: 180, total_colonists: 10, mission_order: 2 },
    { id: 'level-3', name: 'THE BURIED SIGNAL', description: 'Unknown Underground Structure', difficulty: 'EXTREME', timer_seconds: 240, total_colonists: 12, mission_order: 3 }
  ], { onConflict: 'id' });

  // Ensure initial robots exist if missing
  const { data: robots } = await supabaseServer.from('player_robots').select('robot_type').eq('player_id', playerId);
  if (!robots || robots.length === 0) {
    await supabaseServer.from('player_robots').insert([
      { player_id: playerId, robot_type: 'friendly', level: 1 },
      { player_id: playerId, robot_type: 'medic', level: 1 },
      { player_id: playerId, robot_type: 'heavy', level: 1 },
      { player_id: playerId, robot_type: 'emp', level: 1 }
    ]);
  }

  // Ensure Level 1 is always unlocked if not completed
  const { data: progress } = await supabaseServer.from('player_progress').select('*').eq('player_id', playerId).eq('mission_id', 'level-1').single();
  if (!progress || !progress.unlocked) {
    await supabaseServer.from('player_progress').upsert({
      player_id: playerId,
      mission_id: 'level-1',
      unlocked: true,
      completed: progress?.completed || false
    });
  }
}

async function initializeDemoPlayer() {
  // 1. Insert player
  const { data: newPlayer, error: playerError } = await supabaseServer.from('players').upsert({
    username: DEMO_PLAYER_USERNAME,
    batteries: 0,
    support: 0
  }, { onConflict: 'username' }).select('id').single();

  if (playerError || !newPlayer) {
    console.error("Failed to initialize demo player", playerError);
    return null;
  }

  const playerId = newPlayer.id;
  await ensureDemoData(playerId);
  return playerId;
}

export async function getPlayerId() {
  const { data, error } = await supabaseServer
    .from('players')
    .select('id')
    .eq('username', DEMO_PLAYER_USERNAME)
    .single();
    
  if (error || !data) {
    return await initializeDemoPlayer();
  }
  await ensureDemoData(data.id);
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
