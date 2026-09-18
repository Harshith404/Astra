import { NextResponse } from 'next/server';
import { supabaseServer, getPlayerId } from '../../../../lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { levelId, rescued, timeRemaining } = await req.json();

    // 1. Identify player
    const playerId = await getPlayerId();
    if (!playerId) {
      return NextResponse.json({ error: 'Player not found' }, { status: 401 });
    }

    // 2. Validate mission
    const { data: mission } = await supabaseServer
      .from('missions')
      .select('*')
      .eq('id', levelId)
      .single();

    if (!mission) {
      return NextResponse.json({ error: 'Invalid mission' }, { status: 400 });
    }

    // 3. Validate & sanitize values
    const actualRescued = Math.min(Math.max(0, rescued), mission.total_colonists);
    const actualTime = Math.min(Math.max(0, timeRemaining), mission.timer_seconds);

    // 4. Calculate Rewards
    // Base 50 batteries + 20 per survivor + time bonus
    const batteriesEarned = 50 + (actualRescued * 20) + Math.floor(actualTime / 10);
    // Support earned = survivors * 10
    const supportEarned = actualRescued * 10;

    // 5. Update Mission Results (History)
    await supabaseServer.from('mission_results').insert({
      player_id: playerId,
      mission_id: levelId,
      survivors: actualRescued,
      robots_saved: 0, // Simplified for MVP
      communications_restored: true,
      completion_time: mission.timer_seconds - actualTime,
      support_earned: supportEarned,
      batteries_earned: batteriesEarned
    });

    // 6. Update best progress and deduplicate infinite batteries exploit
    const { data: existingProgress } = await supabaseServer
      .from('player_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('mission_id', levelId)
      .single();

    // Only award full batteries and support if the rescue count improved
    let awardedBatteries = 0;
    let awardedSupport = 0;

    const previousBest = existingProgress?.best_survivors || 0;
    
    if (actualRescued > previousBest) {
      // Award the difference to prevent infinite farming of the same level
      awardedBatteries = (actualRescued - previousBest) * 20 + 50; 
      awardedSupport = (actualRescued - previousBest) * 10;

      await supabaseServer.from('player_progress').upsert({
        player_id: playerId,
        mission_id: levelId,
        unlocked: true,
        completed: true,
        best_survivors: actualRescued,
        best_time: mission.timer_seconds - actualTime,
        communications_restored: true
      });
    } else {
      // Minor consolation reward for replay
      awardedBatteries = 10;
    }

    // 7. Update Player Profile
    if (awardedBatteries > 0 || awardedSupport > 0) {
      const { data: profile } = await supabaseServer
        .from('players')
        .select('batteries, support')
        .eq('id', playerId)
        .single();
        
      if (profile) {
        await supabaseServer.from('players').update({
          batteries: profile.batteries + awardedBatteries,
          support: profile.support + awardedSupport
        }).eq('id', playerId);
      }
    }

    // 8. Unlock Next Mission
    if (levelId === 'level-1' && existingProgress && !existingProgress.completed) {
      await supabaseServer.from('player_progress').upsert({
        player_id: playerId,
        mission_id: 'level-2',
        unlocked: true
      });
    }

    return NextResponse.json({ 
      success: true, 
      awardedBatteries, 
      awardedSupport 
    });

  } catch (error) {
    console.error('Mission complete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
