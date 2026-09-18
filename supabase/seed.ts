import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding Supabase Database...');

  // 1. Seed demo player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .upsert({ 
      username: 'demo-player', 
      support: 42, 
      batteries: 1500 
    }, { onConflict: 'username' })
    .select()
    .single();

  if (playerError) {
    console.error('Error seeding player:', playerError);
    return;
  }
  console.log('Seeded player:', player.id);

  // 2. Seed missions
  const { error: missionError } = await supabase
    .from('missions')
    .upsert([
      {
        id: 'level-1',
        name: 'OUTPOST DELTA',
        description: 'Mining / Habitat Outpost',
        difficulty: 'MEDIUM',
        timer_seconds: 120,
        total_colonists: 10,
        required_support: 0,
        mission_order: 1
      },
      {
        id: 'level-2',
        name: 'RESEARCH LAB',
        description: 'Advanced Research Facility',
        difficulty: 'HARD',
        timer_seconds: 300,
        total_colonists: 15,
        required_support: 100,
        mission_order: 2
      }
    ]);

  if (missionError) {
    console.error('Error seeding missions:', missionError);
  } else {
    console.log('Seeded missions.');
  }

  // 3. Seed initial progress (level 1 unlocked)
  const { error: progressError } = await supabase
    .from('player_progress')
    .upsert({
      player_id: player.id,
      mission_id: 'level-1',
      unlocked: true
    });
    
  if (progressError) console.error('Error seeding progress:', progressError);
  else console.log('Seeded initial player progress.');

  // 4. Seed robot levels for this player
  const { error: robotError } = await supabase
    .from('player_robots')
    .upsert([
      { player_id: player.id, robot_type: 'friendly', level: 1, experience: 0 },
      { player_id: player.id, robot_type: 'medic', level: 1, experience: 0 },
      { player_id: player.id, robot_type: 'heavy', level: 1, experience: 0 },
      { player_id: player.id, robot_type: 'emp', level: 1, experience: 0 },
    ]);
    
  if (robotError) console.error('Error seeding robots:', robotError);
  else console.log('Seeded initial robot levels.');

  console.log('Seeding complete.');
}

seed();
