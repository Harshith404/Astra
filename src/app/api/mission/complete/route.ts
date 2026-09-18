import { NextResponse } from 'next/server';
import { updatePlayerProgress } from '../../../../lib/supabaseClient';
import { level1 } from '../../../../game/content/levels/level1';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { levelId, rescued, timeRemaining } = body;

    if (!levelId || rescued === undefined || timeRemaining === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Server-side validation
    // Prevent client-side cheating (e.g., claiming 50 colonists rescued when max is 5)
    let maxColonists = 0;
    let baseBatteries = 0;
    let baseSupport = 0;

    // Hardcode level-1 for MVP, would normally fetch from DB or config map
    if (levelId === 'level-1') {
      maxColonists = level1.totalColonists;
      baseBatteries = level1.rewards.batteries;
      baseSupport = level1.rewards.baseSupport;
    } else {
      return NextResponse.json({ error: 'Invalid level ID' }, { status: 400 });
    }

    // Clamp values
    const actualRescued = Math.min(Math.max(0, rescued), maxColonists);
    
    // Calculate rewards securely on server
    // e.g. 10 batteries per rescued colonist + base
    const batteriesEarned = baseBatteries + (actualRescued * 10);
    const supportEarned = baseSupport + actualRescued;

    // Persist to Supabase
    // In a real app we'd get the userId from auth session
    const success = await updatePlayerProgress('mock-user-123', batteriesEarned, supportEarned);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        rewards: {
          batteries: batteriesEarned,
          support: supportEarned
        }
      });
    } else {
      throw new Error('Database update failed');
    }

  } catch (error) {
    console.error('Mission completion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
