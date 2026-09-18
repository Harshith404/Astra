'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../../game/simulation/gameState';
import { Battery, Zap, Radio, Users, Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GameHUD({ levelId }: { levelId: string }) {
  const store = useGameStore();
  const router = useRouter();
  const [results, setResults] = useState<{
    awardedBatteries: number;
    awardedSupport: number;
    survivors: number;
    timeString: string;
    completed: boolean;
  } | null>(null);

  useEffect(() => {
    if (store.missionStatus === 'success') {
      handleMissionEnd(true);
    } else if (store.missionStatus === 'failure') {
      handleMissionEnd(false);
    }
  }, [store.missionStatus]);

  const handleMissionEnd = async (success: boolean) => {
    // Only fire once
    if (results) return;

    const survivors = store.colonistsRescued;
    const timeRemaining = store.missionTimeLeft;
    const timeStr = `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`;

    if (success) {
      try {
        const res = await fetch('/api/mission/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ levelId, rescued: survivors, timeRemaining })
        });
        const data = await res.json();
        
        setResults({
          completed: true,
          survivors,
          timeString: timeStr,
          awardedBatteries: data.awardedBatteries || 0,
          awardedSupport: data.awardedSupport || 0,
        });
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    } else {
      setResults({
        completed: false,
        survivors,
        timeString: timeStr,
        awardedBatteries: 0,
        awardedSupport: 0,
      });
    }
  };

  if (results) {
    return (
      <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
        <div className="game-hud-panel max-w-md w-full flex flex-col gap-6 p-8 items-center text-center">
          <h2 className={`text-3xl font-black tracking-[0.2em] ${results.completed ? 'text-emerald-400' : 'text-mars-500'}`}>
            MISSION {results.completed ? 'COMPLETE' : 'FAILED'}
          </h2>
          
          <div className="w-full flex flex-col gap-3 font-mono text-mars-100 text-sm">
            <div className="flex justify-between border-b border-mars-900 pb-2">
              <span>COLONISTS RESCUED</span>
              <span className="font-bold text-mars-50">{results.survivors} / {store.colonistsTotal}</span>
            </div>
            <div className="flex justify-between border-b border-mars-900 pb-2">
              <span>ROBOTS RECOVERED</span>
              <span className="font-bold text-mars-50">0</span> {/* Hardcoded for MVP as requested */}
            </div>
            <div className="flex justify-between border-b border-mars-900 pb-2">
              <span>COMMUNICATIONS</span>
              <span className="font-bold text-mars-50">{store.communicationsRestored ? 'RESTORED' : 'OFFLINE'}</span>
            </div>
            <div className="flex justify-between border-b border-mars-900 pb-2">
              <span>TIME REMAINING</span>
              <span className="font-bold text-mars-50">{results.timeString}</span>
            </div>
            
            <div className="flex justify-between mt-2 pt-2 border-t border-mars-500 text-lg">
              <span className="text-neon-cyan flex items-center gap-2"><Users size={16}/> SUPPORT</span>
              <span className="font-black text-neon-cyan">+{results.awardedSupport}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neon-cyan flex items-center gap-2"><Zap size={16}/> BATTERIES</span>
              <span className="font-black text-neon-cyan">+{results.awardedBatteries}</span>
            </div>
          </div>

          <div className="flex gap-4 w-full mt-4">
            <button onClick={() => window.location.reload()} className="flex-1 border border-mars-700 hover:bg-mars-900 py-3 font-bold tracking-widest transition-colors text-xs">
              REPLAY
            </button>
            <Link href="/missions" className="flex-1 bg-mars-700 hover:bg-mars-500 py-3 font-bold tracking-widest transition-colors text-xs flex justify-center items-center">
              CONTINUE
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              
              <div className="w-full h-2 bg-mars-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${(robot.health / robot.maxHealth) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-storm-400">CORRUPTION</span>
                <div className="flex-1 h-1.5 bg-mars-900 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-300 ${robot.corruption > 75 ? 'bg-mars-500' : 'bg-storm-500'}`} 
                    style={{ width: `${robot.corruption}%` }}
                  />
                </div>
              </div>

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

          {/* Robot Deploy Cards */}
          <div className="flex items-end gap-2 pointer-events-auto ml-4">
            {[
              { type: 'friendly', label: 'REPAIR', cost: 10, color: 'text-emerald-400' },
              { type: 'medic', label: 'MEDIC', cost: 25, color: 'text-blue-400' },
              { type: 'heavy', label: 'HEAVY', cost: 40, color: 'text-orange-400' },
              { type: 'emp', label: 'EMP', cost: 15, color: 'text-purple-400' }
            ].map(card => (
              <button 
                key={card.type}
                onClick={() => store.setDeploymentMode(card.type as any)}
                className={`flex flex-col items-center justify-center p-2 rounded border-2 transition-all w-16 h-20 
                  ${store.deploymentMode === card.type ? 'bg-mars-700 border-mars-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-black/80 border-mars-900 hover:border-mars-700'}
                  ${store.missionEnergy < card.cost ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={store.missionEnergy < card.cost}
              >
                <span className={`text-[10px] font-black ${card.color}`}>{card.label}</span>
                <span className="text-neon-cyan font-bold text-xs mt-2">{card.cost}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Energy Status */}
        <div className="game-hud-panel flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-neon-cyan">
            <span className="font-black text-2xl">{store.missionEnergy}</span>
            <Zap size={28} className="text-neon-cyan storm-glow" />
          </div>
          <span className="text-xs font-bold text-mars-100 tracking-widest">DEPLOYMENT ENERGY</span>
        </div>
      </div>
      
      {/* Deployment Mode Overlay Indicator */}
      {store.deploymentMode && (
        <div className="absolute inset-0 pointer-events-none border-4 border-mars-500/50 rounded-lg animate-pulse z-50">
           <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-mars-700/80 px-6 py-2 rounded-full backdrop-blur-sm border border-mars-500 text-mars-50 font-black tracking-widest text-sm shadow-[0_0_20px_rgba(239,68,68,0.5)]">
             CLICK TARGET TO DEPLOY
           </div>
        </div>
      )}
    </div>
  );
}
