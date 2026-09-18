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
  // BASELINE: level-1 is always unlocked — this is the guaranteed minimum
  const baseline = [
    { mission_id: 'level-1', unlocked: true, completed: false },
    { mission_id: 'level-2', unlocked: false, completed: false },
    { mission_id: 'level-3', unlocked: false, completed: false }
  ];

  try {
    const id = await getPlayerId();
    if (!id) return baseline;

    const { data, error } = await supabaseServer
      .from('player_progress')
      .select('*')
      .eq('player_id', id);
      
    if (error || !data || data.length === 0) {
      return baseline;
    }

    // Merge DB data on top of baseline so level-1 is always at least unlocked
    const merged = baseline.map(base => {
      const db = data.find((d: any) => d.mission_id === base.mission_id);
      return db ? { ...base, ...db } : base;
    });
    // Force level-1 unlocked no matter what
    const l1 = merged.find(m => m.mission_id === 'level-1');
    if (l1) l1.unlocked = true;
    return merged;
  } catch (e) {
    console.error('fetchMissionProgress failed entirely, using baseline:', e);
    return baseline;
  }
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
