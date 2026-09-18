import { Robot } from '../../simulation/gameState';

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  timeLimit: number;
  totalColonists: number;
  initialRobots: Robot[];
  rewards: {
    batteries: number;
    baseSupport: number;
  };
  stormIntensity: 'low' | 'medium' | 'high';
}

export const level1: LevelConfig = {
  id: 'level-1',
  name: 'Outpost Delta',
  description: 'A rogue storm has hit Outpost Delta. Communications are down and colonists are trapped. Deploy Astra-1 drone to restore comms and rescue the personnel.',
  timeLimit: 120,
  totalColonists: 5,
  stormIntensity: 'medium',
  initialRobots: [
    {
      id: 'r1_friendly',
      type: 'friendly',
      x: 300,
      y: 400,
      health: 100,
      maxHealth: 100,
      corruption: 0,
      state: 'normal'
    },
    {
      id: 'r2_rogue',
      type: 'enemy',
      x: 600,
      y: 200,
      health: 100,
      maxHealth: 100,
      corruption: 100,
      state: 'rogue'
    }
  ],
  rewards: {
    batteries: 50,
    baseSupport: 10
  }
};
