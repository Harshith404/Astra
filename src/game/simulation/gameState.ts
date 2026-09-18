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

  // Actions for Phaser -> Zustand
  updateMissionTime: (time: number) => void;
  rescueColonist: () => void;
  restoreCommunications: () => void;
  updateRobot: (id: string, partial: Partial<Robot>) => void;
  addRobot: (robot: Robot) => void;
  useEnergy: (amount: number) => boolean;
  completeMission: (status: 'success' | 'failure') => void;

  // Actions for React UI -> Zustand -> Phaser (via listening to changes)
  repairRobot: (id: string) => void;
  deployEmp: (x: number, y: number) => void;
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
  },

  deployEmp: (x, y) => {
    const { useEnergy } = get();
    useEnergy(40);
    // Phaser system will pick up this action and apply AoE stun/damage
  }
}));
