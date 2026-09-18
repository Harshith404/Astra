import { create } from 'zustand';

// --- Game State Types ---

export type EntityState = 'normal' | 'corrupted' | 'rogue' | 'destroyed';

export interface Robot {
  id: string;
  type: 'friendly' | 'enemy';
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  corruption: number; // 0 to 100
  state: EntityState;
}

export interface GameState {
  // Mission Info
  missionTimeLeft: number;
  colonistsRescued: number;
  colonistsTotal: number;
  missionEnergy: number;
  maxMissionEnergy: number;
  communicationsRestored: boolean;
  missionStatus: 'briefing' | 'active' | 'success' | 'failure';

  // Entities
  robots: Record<string, Robot>;
  deploymentMode: 'friendly' | 'medic' | 'heavy' | 'emp' | null;

  // Actions for Phaser -> Zustand
  updateMissionTime: (time: number) => void;
  rescueColonist: () => void;
  restoreCommunications: () => void;
  updateRobot: (id: string, partial: Partial<Robot>) => void;
  addRobot: (robot: Robot) => void;
  useEnergy: (amount: number) => boolean;
  completeMission: (status: 'success' | 'failure') => void;

  // Player actions from UI
  setDeploymentMode: (type: 'friendly' | 'medic' | 'heavy' | 'emp' | null) => void;
  deployRobot: (type: string, x: number, y: number) => void;
  repairRobot: (id: string) => void;
  damageRobot: (id: string, amount: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  missionTimeLeft: 120, // seconds
  colonistsRescued: 0,
  colonistsTotal: 10,
  missionEnergy: 85,
  maxMissionEnergy: 100,
  communicationsRestored: false,
  missionStatus: 'briefing',
  robots: {},
  deploymentMode: null,

  setDeploymentMode: (type) => set({ deploymentMode: type as any }),

  deployRobot: (type, x, y) => {
    const { useEnergy, addRobot } = get();
    // Simplified costs for MVP
    const costs: Record<string, number> = { friendly: 10, medic: 25, heavy: 40, emp: 15 };
    const cost = costs[type] || 20;

    if (useEnergy(cost)) {
      const id = `${type}_${Date.now()}`;
      addRobot({
        id,
        type: type === 'emp' ? 'projectile' : 'friendly',
        x,
        y,
        health: 100,
        maxHealth: 100,
        corruption: 0,
        state: 'normal'
      });
      set({ deploymentMode: null }); // Exit mode after deploy
    }
  },

  damageRobot: (id, amount) => set((state) => {
    const robot = state.robots[id];
    if (!robot || robot.state === 'destroyed') return state;
    
    const newHealth = Math.max(0, robot.health - amount);
    return {
      robots: {
        ...state.robots,
        [id]: { ...robot, health: newHealth, state: newHealth === 0 ? 'destroyed' : robot.state }
      }
    };
  }),

  updateMissionTime: (time) => set({ missionTimeLeft: Math.max(0, time) }),
  
  rescueColonist: () => set((state) => ({ 
    colonistsRescued: Math.min(state.colonistsTotal, state.colonistsRescued + 1) 
  })),

  restoreCommunications: () => set({ communicationsRestored: true }),

  updateRobot: (id, partial) => set((state) => {
    const robot = state.robots[id];
    if (!robot) return state;
    
    let newState = robot.state;
    const newCorruption = partial.corruption !== undefined ? partial.corruption : robot.corruption;
    
    // Threshold check logic
    if (newState === 'normal' && newCorruption >= 100) {
      newState = 'rogue';
    }

    return {
      robots: {
        ...state.robots,
        [id]: { ...robot, ...partial, state: newState }
      }
    };
  }),

  addRobot: (robot) => set((state) => ({
    robots: { ...state.robots, [robot.id]: robot }
  })),

  useEnergy: (amount) => {
    const { missionEnergy } = get();
    if (missionEnergy >= amount) {
      set({ missionEnergy: missionEnergy - amount });
      return true;
    }
    return false;
  },

  completeMission: (status) => set({ missionStatus: status }),

  // Player actions from UI (Phaser logic will listen for these or process them in systems)
  repairRobot: (id) => {
    const { useEnergy, updateRobot } = get();
    if (useEnergy(20)) {
      updateRobot(id, { corruption: Math.max(0, get().robots[id].corruption - 50) });
    }
  }
}));
