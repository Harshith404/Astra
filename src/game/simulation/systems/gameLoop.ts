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

  // 2. Systems Update (update periodically)
  if (frameCount % 30 === 0) { // Every ~30 frames (twice a second)
    const robots = Object.values(store.robots);
    
    robots.forEach(robot => {
      if (robot.state === 'destroyed') return;

      // --- CORRUPTION & SHIELD/REPAIR LOGIC ---
      if (robot.type === 'friendly' && robot.state === 'normal') {
        // Find nearby helpers
        let shielded = false;
        let repaired = false;

        robots.forEach(other => {
          if (other.id !== robot.id && other.type === 'friendly' && other.state === 'normal') {
            const dist = Math.hypot(robot.x - other.x, robot.y - other.y);
            if (other.subType === 'shield' && dist < 150) shielded = true;
            if (other.subType === 'repair' && dist < 100) repaired = true;
          }
        });

        let newCorruption = robot.corruption;
        let newHealth = robot.health;

        if (repaired) {
          newCorruption = Math.max(0, newCorruption - 10);
          newHealth = Math.min(robot.maxHealth, newHealth + 10);
        } else if (shielded) {
          newCorruption = Math.max(0, newCorruption - 2);
        } else {
          newCorruption = Math.min(100, newCorruption + 2); // Storm buildup
        }

        let newState: any = robot.state;
        if (newCorruption >= 100) {
          newState = 'rogue';
        }

        if (newCorruption !== robot.corruption || newHealth !== robot.health || newState !== robot.state) {
          store.updateRobot(robot.id, { corruption: newCorruption, health: newHealth, state: newState });
        }
      }

      // --- COMBAT LOGIC ---
      if (robot.type === 'friendly' && robot.state === 'normal' && robot.subType !== 'repair' && robot.subType !== 'shield') {
        // Find nearest rogue
        let targetId = null;
        let minDist = 200; // Attack range
        
        robots.forEach(other => {
          if (other.state === 'rogue') {
            const dist = Math.hypot(robot.x - other.x, robot.y - other.y);
            if (dist < minDist) { minDist = dist; targetId = other.id; }
          }
        });

        if (targetId) {
          store.damageRobot(targetId, robot.subType === 'heavy' ? 20 : 10);
        }
      }

      if (robot.state === 'rogue') {
        // Rogue attacks friendlies (player is separate, handled in Scene for now or we can damage player if player had health)
        let targetId = null;
        let minDist = 150;
        
        robots.forEach(other => {
          if (other.type === 'friendly' && other.state === 'normal') {
            const dist = Math.hypot(robot.x - other.x, robot.y - other.y);
            if (dist < minDist) { minDist = dist; targetId = other.id; }
          }
        });

        if (targetId) {
          store.damageRobot(targetId, 15);
        }
      }
    });
  }
}
