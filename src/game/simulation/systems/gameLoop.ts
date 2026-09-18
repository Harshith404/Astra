import { useGameStore } from '../gameState';

let lastTime = performance.now();
let frameCount = 0;

export function updateSimulation(time: number, delta: number) {
  const store = useGameStore.getState();
  if (store.missionStatus !== 'active') return;

  frameCount++;
  
  // 1. Timer System (update roughly once per second)
  if (time - lastTime >= 1000) {
    store.updateMissionTime(store.missionTimeLeft - 1);
    
    // Check timeout
    if (store.missionTimeLeft <= 1) {
      store.completeMission('failure');
    }

    lastTime = time;
  }

  // 2. Corruption System (update periodically)
  if (frameCount % 60 === 0) { // Every ~60 frames
    Object.values(store.robots).forEach(robot => {
      if (robot.type === 'friendly' && robot.state === 'normal') {
        // Increase corruption slightly over time (storm effect)
        store.updateRobot(robot.id, { 
          corruption: Math.min(100, robot.corruption + 2) 
        });
      }
    });
  }
}
