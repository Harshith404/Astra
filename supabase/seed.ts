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
        difficulty: 'EASY',
        timer_seconds: 120,
        total_colonists: 10,
        required_support: 0,
        mission_order: 1
      },
      {
        id: 'level-2',
        name: 'HELIOS LAB',
        description: 'Research Facility',
        difficulty: 'MEDIUM',
        timer_seconds: 180,
        total_colonists: 12,
        required_support: 100,
        mission_order: 2
      },
      {
        id: 'level-3',
        name: 'COMMS HUB',
        description: 'Communications Relay',
        difficulty: 'HARD',
        timer_seconds: 240,
        total_colonists: 15,
        required_support: 200,
        mission_order: 3
      },
      {
        id: 'level-4',
        name: 'OXYGEN FACILITY',
        description: 'Hydroponics + Oxygen Production',
        difficulty: 'HARD',
        timer_seconds: 200,
        total_colonists: 8,
        required_support: 350,
        mission_order: 4
      },
      {
        id: 'level-5',
        name: 'ARES REACTOR',
        description: 'Main Energy / Reactor Facility',
        difficulty: 'VERY HARD',
        timer_seconds: 300,
        total_colonists: 20,
        required_support: 500,
        mission_order: 5
      },
      {
        id: 'level-6',
        name: 'THE BURIED SIGNAL',
        description: 'Unknown underground structure',
        difficulty: 'EXTREME',
        timer_seconds: 400,
        total_colonists: 5,
        required_support: 800,
        mission_order: 6
      },
      {
        id: 'level-7',
        name: 'ASTRA',
        description: 'Deep Structure',
        difficulty: 'ASTRA',
        timer_seconds: 500,
        total_colonists: 1,
        required_support: 1000,
        mission_order: 7
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
