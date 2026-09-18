'use client';

import { useEffect } from 'react';
import { useGameStore } from '../../game/simulation/gameState';
import { Battery, Zap, Radio, Users, Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GameHUD() {
  const store = useGameStore();
  const router = useRouter();

  // Watch for mission success/failure
  useEffect(() => {
    if (store.missionStatus === 'success') {
      handleMissionEnd(true);
    } else if (store.missionStatus === 'failure') {
      handleMissionEnd(false);
    }
  }, [store.missionStatus]);

  const handleMissionEnd = async (success: boolean) => {
    // In a real game, this would pause the game and show a modal before routing
    alert(success ? 'MISSION SUCCESS!' : 'MISSION FAILED.');
    
    if (success) {
      try {
        await fetch('/api/mission/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            levelId: 'level-1', 
            rescued: store.colonistsRescued,
            timeRemaining: store.missionTimeLeft
          })
        });
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }
    
    router.push('/');
  };

  if (store.missionStatus !== 'active') return null;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="game-hud-panel flex flex-col gap-2 min-w-[200px]">
          <div className="flex items-center gap-2 text-mars-100">
            <Radio size={18} className={store.communicationsRestored ? "text-neon-cyan" : "text-mars-500"} />
            <span className="font-bold tracking-wider text-sm">COMMS: {store.communicationsRestored ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <div className="flex items-center gap-2 text-mars-100">
            <Users size={18} className="text-emerald-400" />
            <span className="font-bold tracking-wider text-sm">RESCUED: {store.colonistsRescued} / {store.colonistsTotal}</span>
          </div>
        </div>

        <div className="game-hud-panel flex items-center gap-3">
          <Clock size={24} className={store.missionTimeLeft < 30 ? "text-mars-500 animate-pulse" : "text-mars-100"} />
          <span className={`text-2xl font-black tabular-nums tracking-widest ${store.missionTimeLeft < 30 ? "text-mars-500" : "text-mars-50"}`}>
            {Math.floor(store.missionTimeLeft / 60)}:{(store.missionTimeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Bottom Bar: Robot Status & Actions */}
      <div className="flex justify-between items-end">
        <div className="flex gap-4">
          {Object.values(store.robots).filter(r => r.type === 'friendly').map(robot => (
            <div key={robot.id} className="game-hud-panel flex flex-col gap-2 w-[220px]">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-mars-100">ASTRA DRONE</span>
                {robot.state === 'rogue' && <AlertTriangle size={16} className="text-mars-500 animate-pulse" />}
              </div>
              
              {/* Health Bar */}
              <div className="w-full h-2 bg-mars-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${(robot.health / robot.maxHealth) * 100}%` }}
                />
              </div>

              {/* Corruption Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-storm-400">CORRUPTION</span>
                <div className="flex-1 h-1.5 bg-mars-900 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-300 ${robot.corruption > 75 ? 'bg-mars-500' : 'bg-storm-500'}`} 
                    style={{ width: `${robot.corruption}%` }}
                  />
                </div>
              </div>

              {/* Actions (Pointer events enabled here) */}
              <div className="flex gap-2 mt-2 pointer-events-auto">
                <button 
                  onClick={() => store.repairRobot(robot.id)}
                  disabled={robot.state === 'rogue' || store.missionEnergy < 20}
                  className="flex-1 bg-mars-700 hover:bg-mars-500 disabled:opacity-50 disabled:hover:bg-mars-700 text-xs font-bold py-1.5 rounded text-mars-50 transition-colors"
                >
                  REPAIR (20)
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Energy Status */}
        <div className="game-hud-panel flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-neon-cyan">
            <span className="font-black text-xl">{store.missionEnergy}</span>
            <Zap size={24} className="text-neon-cyan storm-glow" />
          </div>
          <span className="text-xs font-bold text-mars-100 tracking-widest">DEPLOYMENT ENERGY</span>
        </div>
      </div>
    </div>
  );
}
