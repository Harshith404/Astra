import { create } from 'zustand';

// --- Game State Types ---

export type EntityState = 'normal' | 'corrupted' | 'rogue' | 'destroyed';

export interface Robot {
  id: string;
  type: 'friendly' | 'enemy' | 'projectile';
  subType?: 'standard' | 'repair' | 'heavy' | 'shield';
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  corruption: number; // 0 to 100
  state: EntityState;
}

export interface GameState {
  // Mission Info
  currentLevelId: string;
  missionTimeLeft: number;
  colonistsRescued: number;
  colonistsTotal: number;
  dataRecovered: number;
  dataTotal: number;
  anomaliesInvestigated: number;
  anomaliesTotal: number;
  astraFound: boolean;
  robotsRecovered: number;
  robotsDeployed: number;
  robotsLost: number;
  missionEnergy: number;
  maxMissionEnergy: number;
  communicationsRestored: boolean;
  missionStatus: 'briefing' | 'active' | 'success' | 'failure';

  // UI Flow States
  briefing: boolean;
  cinematicPlaying: boolean;
  missionComplete: boolean;

  // Entities
  robots: Record<string, Robot>;
  deploymentMode: 'standard' | 'repair' | 'heavy' | 'shield' | null;

  // Actions for Phaser -> Zustand
  updateMissionTime: (time: number) => void;
  rescueColonist: () => void;
  restoreCommunications: () => void;
  recoverData: () => void;
  investigateAnomaly: () => void;
  findAstra: () => void;
  recoverRobot: () => void;
  updateRobot: (id: string, partial: Partial<Robot>) => void;
  addRobot: (robot: Robot) => void;
  consumeEnergy: (amount: number) => boolean;
  completeMission: (status: 'success' | 'failure' | 'active') => void;
  startSimulation: (config?: any) => void;
  updateSimulation: (time: number, delta: number) => void;

  // Player actions from UI
  setDeploymentMode: (type: 'standard' | 'repair' | 'heavy' | 'shield' | null) => void;
  deployRobot: (type: string, x: number, y: number) => void;
  repairRobot: (id: string) => void;
  damageRobot: (id: string, amount: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  currentLevelId: 'unknown',
  missionTimeLeft: 120, // seconds
  colonistsRescued: 0,
  colonistsTotal: 10,
  dataRecovered: 0,
  dataTotal: 0,
  anomaliesInvestigated: 0,
  anomaliesTotal: 0,
  astraFound: false,
  robotsRecovered: 0,
  robotsDeployed: 0,
  robotsLost: 0,
  missionEnergy: 100,
  maxMissionEnergy: 100,
  communicationsRestored: false,
  missionStatus: 'briefing',
  briefing: true,
  cinematicPlaying: false,
  missionComplete: false,
  robots: {},
  deploymentMode: null,

  setDeploymentMode: (type) => set({ deploymentMode: type as any }),

  deployRobot: (type, x, y) => {
    const { consumeEnergy, addRobot } = get();
    const costs: Record<string, number> = { standard: 10, repair: 25, heavy: 40, shield: 30 };
    const cost = costs[type] || 20;

    if (consumeEnergy(cost)) {
      const id = `${type}_${Date.now()}`;
      addRobot({
        id,
        type: 'friendly',
        subType: type as 'standard' | 'repair' | 'heavy' | 'shield',
        x,
        y,
        health: type === 'heavy' ? 200 : 100,
        maxHealth: type === 'heavy' ? 200 : 100,
        corruption: 0,
        state: 'normal'
      });
      set((state) => ({ deploymentMode: null, robotsDeployed: state.robotsDeployed + 1 })); // Exit mode after deploy
    }
  },

  damageRobot: (id, amount) => set((state) => {
    const robot = state.robots[id];
    if (!robot || robot.state === 'destroyed') return state;
    
    const newHealth = Math.max(0, robot.health - amount);
    const isDestroyed = newHealth === 0;
    
    return {
      robots: {
        ...state.robots,
        [id]: { ...robot, health: newHealth, state: isDestroyed ? 'destroyed' : robot.state }
      },
      robotsLost: isDestroyed && robot.type === 'friendly' ? state.robotsLost + 1 : state.robotsLost
    };
  }),

  updateMissionTime: (time) => set({ missionTimeLeft: Math.max(0, time) }),
  
  rescueColonist: () => set((state) => ({ 
    colonistsRescued: Math.min(state.colonistsTotal, state.colonistsRescued + 1) 
  })),

  recoverData: () => set((state) => ({ 
    dataRecovered: Math.min(state.dataTotal, state.dataRecovered + 1) 
  })),

  investigateAnomaly: () => set((state) => ({ 
    anomaliesInvestigated: Math.min(state.anomaliesTotal, state.anomaliesInvestigated + 1) 
  })),

  findAstra: () => set({ astraFound: true }),

  recoverRobot: () => set((state) => ({ 
    robotsRecovered: state.robotsRecovered + 1 
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

  consumeEnergy: (amount) => {
    const { missionEnergy } = get();
    if (missionEnergy >= amount) {
      set({ missionEnergy: missionEnergy - amount });
      return true;
    }
    return false;
  },

  completeMission: async (result) => {
    const state = get();
    if (state.missionStatus !== 'active') return;
    
    set({ missionStatus: result, missionComplete: result !== 'active' });

    if (result === 'active') return; // Just starting/deploying

    // Supabase persist logic
    try {
      const res = await fetch('/api/mission/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          levelId: state.currentLevelId,
          rescued: state.colonistsRescued, 
          timeRemaining: state.missionTimeLeft 
        })
      });
      if (res.ok) {
        console.log("Progress saved");
      }
    } catch (e) {
      console.error(e);
    }
  },

  startSimulation: (config) => {
    if (!config) return;
    set({
      currentLevelId: config.id || 'unknown',
      missionStatus: 'briefing',
      missionEnergy: config.startingEnergy,
      robots: {},
      communicationsRestored: false,
      colonistsRescued: 0,
      colonistsTotal: config.totalColonists,
      dataRecovered: 0,
      dataTotal: config.dataTotal,
      anomaliesTotal: config.anomaliesTotal,
      anomaliesInvestigated: 0,
      astraFound: false,
      briefing: true,
      cinematicPlaying: false,
      missionComplete: false,
      robotsDeployed: 0,
      robotsLost: 0
    });
  },

  updateSimulation: (time, delta) => {
    // handled by updateSimulation function from external logic usually, or just implemented here as a no-op if unused.
  },

  // Player actions from UI (Phaser logic will listen for these or process them in systems)
  repairRobot: (id) => {
    const { consumeEnergy, updateRobot } = get();
    if (consumeEnergy(20)) {
      updateRobot(id, { corruption: Math.max(0, get().robots[id].corruption - 50) });
    }
  }
}));
