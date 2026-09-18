import { NextResponse } from 'next/server';
import { supabaseServer, getPlayerId } from '../../../../lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { robotType } = await req.json();

    const playerId = await getPlayerId();
    if (!playerId) {
      return NextResponse.json({ error: 'Player not found' }, { status: 401 });
    }

    // 1. Fetch player and robot current state
    const [playerRes, robotRes] = await Promise.all([
      supabaseServer.from('players').select('batteries').eq('id', playerId).single(),
      supabaseServer.from('player_robots').select('*').eq('player_id', playerId).eq('robot_type', robotType).single()
    ]);

    const player = playerRes.data;
    const robot = robotRes.data;

    if (!player || !robot) {
      return NextResponse.json({ error: 'Data not found' }, { status: 400 });
    }

    // 2. Calculate upgrade cost (Level 1->2 = 250, 2->3 = 500, etc.)
    const cost = robot.level * 250;

    // 3. Verify batteries
    if (player.batteries < cost) {
      return NextResponse.json({ error: 'Insufficient batteries' }, { status: 400 });
    }

    // 4. Perform atomic-like update
    await Promise.all([
      supabaseServer.from('players').update({ batteries: player.batteries - cost }).eq('id', playerId),
      supabaseServer.from('player_robots').update({ level: robot.level + 1 }).eq('player_id', playerId).eq('robot_type', robotType)
    ]);

    return NextResponse.json({ 
      success: true, 
      newLevel: robot.level + 1,
      remainingBatteries: player.batteries - cost
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
