'use server';

import { getPlayerProfile, getPlayerId, supabaseServer } from '../lib/supabase/server';

export async function fetchProfile() {
  const profile = await getPlayerProfile();
  if (profile) {
    return {
      batteries: profile.batteries,
      colonySupport: profile.support
    };
  }
  // Fallback if not seeded yet
  return { batteries: 0, colonySupport: 0 };
}

export async function fetchMissionProgress() {
  const id = await getPlayerId();
  if (!id) return [];

  const { data, error } = await supabaseServer
    .from('player_progress')
    .select('*')
    .eq('player_id', id);
    
  if (error || !data) {
    console.error("Failed to fetch player_progress, falling back to safe default:", error);
    return [
      { mission_id: 'level-1', unlocked: true, completed: false },
      { mission_id: 'level-2', unlocked: false, completed: false },
      { mission_id: 'level-3', unlocked: false, completed: false }
    ];
  }
    
  return data;
}

export async function fetchPlayerRobots() {
  const id = await getPlayerId();
  if (!id) return [];

  const { data } = await supabaseServer
    .from('player_robots')
    .select('*')
    .eq('player_id', id)
    .order('robot_type');
    
  return data || [];
}
