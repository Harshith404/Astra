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

  const { data } = await supabaseServer
    .from('player_progress')
    .select('*')
    .eq('player_id', id);
    
  return data || [];
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
