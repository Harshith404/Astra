import { Robot } from '../simulation/gameState';

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  timeLimit: number;
  totalColonists: number;
  initialRobots: Robot[];
  stormIntensity: 'low' | 'medium' | 'high' | 'extreme';
  objectiveText: string;
  difficulty: string;
}

export const CAMPAIGN_MISSIONS: LevelConfig[] = [
  {
    id: 'level-1',
    name: 'OUTPOST DELTA',
    description: 'Mining / Habitat Outpost. Restore comms and rescue the personnel.',
    timeLimit: 120,
    totalColonists: 10,
    stormIntensity: 'medium',
    objectiveText: 'RESCUE TRAPPED COLONISTS AND RESTORE COMMS',
    difficulty: 'EASY',
    initialRobots: [
      { id: 'r1_friendly', type: 'friendly', x: 300, y: 400, health: 100, maxHealth: 100, corruption: 0, state: 'normal' },
      { id: 'r2_rogue', type: 'enemy', x: 600, y: 200, health: 100, maxHealth: 100, corruption: 100, state: 'rogue' },
      { id: 'r3_rogue', type: 'enemy', x: 900, y: 400, health: 100, maxHealth: 100, corruption: 100, state: 'rogue' }
    ]
  },
  {
    id: 'level-2',
    name: 'HELIOS LAB',
    description: 'Research Facility. Rescue scientists and recover research data.',
    timeLimit: 180,
    totalColonists: 12,
    stormIntensity: 'medium',
    objectiveText: 'SECURE HELIOS LAB AND AVOID ROGUE PATROLS',
    difficulty: 'MEDIUM',
    initialRobots: [
      { id: 'r2_1_rogue', type: 'enemy', x: 400, y: 400, health: 150, maxHealth: 150, corruption: 100, state: 'rogue' },
      { id: 'r2_2_rogue', type: 'enemy', x: 800, y: 800, health: 150, maxHealth: 150, corruption: 100, state: 'rogue' },
      { id: 'r2_3_rogue', type: 'enemy', x: 1000, y: 200, health: 150, maxHealth: 150, corruption: 100, state: 'rogue' }
    ]
  },
  {
    id: 'level-3',
    name: 'COMMS HUB',
    description: 'Communications Relay. Defend relay stations and rescue technicians.',
    timeLimit: 240,
    totalColonists: 15,
    stormIntensity: 'high',
    objectiveText: 'RESTORE MULTIPLE COMMUNICATION RELAYS',
    difficulty: 'HARD',
    initialRobots: [
      { id: 'r3_1_rogue', type: 'enemy', x: 500, y: 500, health: 200, maxHealth: 200, corruption: 100, state: 'rogue' },
      { id: 'r3_2_rogue', type: 'enemy', x: 700, y: 300, health: 200, maxHealth: 200, corruption: 100, state: 'rogue' },
      { id: 'r3_3_rogue', type: 'enemy', x: 300, y: 800, health: 200, maxHealth: 200, corruption: 100, state: 'rogue' },
      { id: 'r3_4_rogue', type: 'enemy', x: 1200, y: 600, health: 200, maxHealth: 200, corruption: 100, state: 'rogue' }
    ]
  },
  {
    id: 'level-4',
    name: 'OXYGEN FACILITY',
    description: 'Hydroponics + Oxygen Production. Stabilize oxygen systems.',
    timeLimit: 200,
    totalColonists: 8,
    stormIntensity: 'high',
    objectiveText: 'STABILIZE OXYGEN PRESSURE. SAVE COLONISTS QUICKLY.',
    difficulty: 'HARD',
    initialRobots: [
      { id: 'r4_1_rogue', type: 'enemy', x: 400, y: 700, health: 250, maxHealth: 250, corruption: 100, state: 'rogue' },
      { id: 'r4_2_rogue', type: 'enemy', x: 1000, y: 300, health: 250, maxHealth: 250, corruption: 100, state: 'rogue' },
      { id: 'r4_3_rogue', type: 'enemy', x: 800, y: 900, health: 250, maxHealth: 250, corruption: 100, state: 'rogue' }
    ]
  },
  {
    id: 'level-5',
    name: 'ARES REACTOR',
    description: 'Main Energy / Reactor Facility. Stabilize reactor.',
    timeLimit: 300,
    totalColonists: 20,
    stormIntensity: 'extreme',
    objectiveText: 'STABILIZE REACTOR. HEAVY ROGUE PRESENCE DETECTED.',
    difficulty: 'VERY HARD',
    initialRobots: [
      { id: 'r5_1_rogue', type: 'enemy', x: 600, y: 500, health: 400, maxHealth: 400, corruption: 100, state: 'rogue' },
      { id: 'r5_2_rogue', type: 'enemy', x: 900, y: 700, health: 400, maxHealth: 400, corruption: 100, state: 'rogue' },
      { id: 'r5_3_rogue', type: 'enemy', x: 400, y: 900, health: 400, maxHealth: 400, corruption: 100, state: 'rogue' },
      { id: 'r5_4_rogue', type: 'enemy', x: 1100, y: 400, health: 400, maxHealth: 400, corruption: 100, state: 'rogue' }
    ]
  },
  {
    id: 'level-6',
    name: 'THE BURIED SIGNAL',
    description: 'Unknown underground structure. Investigate anomaly.',
    timeLimit: 400,
    totalColonists: 5,
    stormIntensity: 'extreme',
    objectiveText: 'INVESTIGATE ANOMALY. SURVIVE CORRUPTED SYSTEMS.',
    difficulty: 'EXTREME',
    initialRobots: [
      { id: 'r6_1_rogue', type: 'enemy', x: 500, y: 500, health: 600, maxHealth: 600, corruption: 100, state: 'rogue' },
      { id: 'r6_2_rogue', type: 'enemy', x: 1000, y: 500, health: 600, maxHealth: 600, corruption: 100, state: 'rogue' },
      { id: 'r6_3_rogue', type: 'enemy', x: 750, y: 800, health: 600, maxHealth: 600, corruption: 100, state: 'rogue' }
    ]
  },
  {
    id: 'level-7',
    name: 'ASTRA',
    description: 'Deep Structure. LOCATE ASTRA.',
    timeLimit: 500,
    totalColonists: 1,
    stormIntensity: 'extreme',
    objectiveText: 'LOCATE ASTRA. MAXIMAL DANGER.',
    difficulty: 'ASTRA',
    initialRobots: [
      { id: 'r7_1_rogue', type: 'enemy', x: 800, y: 600, health: 1000, maxHealth: 1000, corruption: 100, state: 'rogue' }
    ]
  }
];

export const getMissionConfig = (id: string): LevelConfig => {
  return CAMPAIGN_MISSIONS.find(m => m.id === id) || CAMPAIGN_MISSIONS[0];
};
