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
    description: 'Mining / Habitat Outpost. Restore comms and rescue personnel.',
    timeLimit: 120,
    totalColonists: 8,
    stormIntensity: 'medium',
    objectiveText: 'RESCUE TRAPPED COLONISTS AND RESTORE COMMS',
    difficulty: 'MEDIUM',
    initialRobots: [
      { id: 'r1_friendly', type: 'friendly', x: 400, y: 600, health: 100, maxHealth: 100, corruption: 0, state: 'normal' },
      { id: 'r1_rogue1', type: 'enemy', x: 800, y: 400, health: 100, maxHealth: 100, corruption: 100, state: 'rogue' },
      { id: 'r1_rogue2', type: 'enemy', x: 1200, y: 800, health: 100, maxHealth: 100, corruption: 100, state: 'rogue' }
    ]
  },
  {
    id: 'level-2',
    name: 'HELIOS LAB',
    description: 'Research Facility. Recover research data and rescue scientists.',
    timeLimit: 180,
    totalColonists: 10,
    stormIntensity: 'high',
    objectiveText: 'RECOVER DATA, RESCUE SCIENTISTS, RESTORE COMMS',
    difficulty: 'HARD',
    initialRobots: [
      { id: 'r2_rogue1', type: 'enemy', x: 500, y: 500, health: 150, maxHealth: 150, corruption: 100, state: 'rogue' },
      { id: 'r2_rogue2', type: 'enemy', x: 900, y: 300, health: 150, maxHealth: 150, corruption: 100, state: 'rogue' },
      { id: 'r2_rogue3', type: 'enemy', x: 1300, y: 900, health: 150, maxHealth: 150, corruption: 100, state: 'rogue' },
      { id: 'r2_rogue4', type: 'enemy', x: 700, y: 800, health: 150, maxHealth: 150, corruption: 100, state: 'rogue' }
    ]
  },
  {
    id: 'level-3',
    name: 'THE BURIED SIGNAL',
    description: 'Unknown Underground Structure. Investigate anomaly and locate Astra.',
    timeLimit: 240,
    totalColonists: 5,
    stormIntensity: 'extreme',
    objectiveText: 'INVESTIGATE ANOMALY. RESTORE RELAY. FIND ASTRA.',
    difficulty: 'ASTRA',
    initialRobots: [
      { id: 'r3_rogue1', type: 'enemy', x: 600, y: 600, health: 250, maxHealth: 250, corruption: 100, state: 'rogue' },
      { id: 'r3_rogue2', type: 'enemy', x: 1000, y: 400, health: 250, maxHealth: 250, corruption: 100, state: 'rogue' },
      { id: 'r3_rogue3', type: 'enemy', x: 800, y: 1000, health: 250, maxHealth: 250, corruption: 100, state: 'rogue' },
      { id: 'r3_rogue4', type: 'enemy', x: 1200, y: 600, health: 250, maxHealth: 250, corruption: 100, state: 'rogue' }
    ]
  }
];

export const getMissionConfig = (id: string): LevelConfig => {
  return CAMPAIGN_MISSIONS.find(m => m.id === id) || CAMPAIGN_MISSIONS[0];
};
