'use client';

import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../../game/simulation/gameState';
import { Zap, Users, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GameHUD({ levelId }: { levelId: string }) {
  const store = useGameStore();
  const [results, setResults] = useState<{
    awardedBatteries: number;
    awardedSupport: number;
    survivors: number;
    timeString: string;
    completed: boolean;
  } | null>(null);

  // moved down

  const handleMissionEnd = useCallback(async (success: boolean) => {
    // Only process once
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
  }, [results, store.colonistsRescued, store.missionTimeLeft, levelId]);

  useEffect(() => {
    if (store.missionStatus === 'success' && !results) {
      setTimeout(() => handleMissionEnd(true), 0);
    } else if (store.missionStatus === 'failure' && !results) {
      setTimeout(() => handleMissionEnd(false), 0);
    }
  }, [store.missionStatus, results, handleMissionEnd]);

  if (store.cinematicPlaying) {
    return (
      <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center pointer-events-auto">
        <div className="flex flex-col items-center gap-12 font-mono tracking-[0.5em] text-white">
          <style>{`
            @keyframes cinematicFade { 0% { opacity: 0; } 100% { opacity: 1; } }
            .c-fade { animation: cinematicFade 2s forwards; opacity: 0; }
            .c-delay-1 { animation-delay: 1s; }
            .c-delay-2 { animation-delay: 3s; }
            .c-delay-3 { animation-delay: 5s; }
            .c-delay-4 { animation-delay: 7s; }
            .c-delay-5 { animation-delay: 10s; }
          `}</style>
          
          {/* Text Sequence */}
          <div className="flex flex-col items-center gap-8 absolute top-1/3">
            <span className="text-sm opacity-50 c-fade c-delay-1">SIGNAL LOCKED</span>
            <h1 className="text-6xl font-black text-neon-cyan tracking-[0.2em] shadow-lg c-fade c-delay-2">ASTRA</h1>
            <span className="text-emerald-400 c-fade c-delay-3">LOCATION CONFIRMED</span>
            <span className="text-2xl mt-8 tracking-widest text-white/80 animate-pulse c-fade c-delay-4">SHE&apos;S ALIVE</span>
          </div>

          {/* Final Story Card */}
          <div className="game-hud-panel border-l-4 border-l-neon-cyan bg-black/90 p-10 flex flex-col gap-6 c-fade c-delay-5 z-10 w-[500px]">
            <div className="border-b border-mars-900 pb-4">
              <h2 className="text-4xl font-black text-white tracking-widest">ASTRA-1</h2>
              <span className="text-neon-cyan text-sm tracking-[0.2em]">EMERGENCY PROTECTOR</span>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-mars-400">STATUS:</span>
                <span className="text-emerald-400 font-bold">ALIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mars-400">LOCATION:</span>
                <span className="text-white">UNKNOWN STRUCTURE — MARS</span>
              </div>
              <div className="flex justify-between mt-4 border-t border-mars-900 pt-4">
                <span className="text-mars-400">MISSION STATUS:</span>
                <span className="text-neon-cyan font-bold animate-pulse">SIGNAL ACQUIRED</span>
              </div>
            </div>
            
            <Link href="/missions" className="mt-8 w-full bg-mars-700 hover:bg-mars-500 py-4 font-black tracking-widest text-white transition-colors border border-mars-500 text-center text-sm block">
              [ RETURN TO COMMAND ]
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            {store.dataTotal > 0 && (
              <div className="flex justify-between border-b border-mars-900 pb-2">
                <span>DATA RECOVERED</span>
                <span className="font-bold text-mars-50">{store.dataRecovered} / {store.dataTotal}</span>
              </div>
            )}
            {store.anomaliesTotal > 0 && (
              <div className="flex justify-between border-b border-mars-900 pb-2">
                <span>ANOMALIES INVESTIGATED</span>
                <span className="font-bold text-mars-50">{store.anomaliesInvestigated} / {store.anomaliesTotal}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-mars-900 pb-2">
              <span>ROBOTS RECOVERED</span>
              <span className="font-bold text-mars-50">{store.robotsRecovered}</span>
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
            <button onClick={() => window.location.reload()} className="flex-1 border border-mars-700 hover:bg-mars-900 py-3 font-bold tracking-widest transition-colors text-xs pointer-events-auto">
              REPLAY
            </button>
            <Link href="/missions" className="flex-1 bg-mars-700 hover:bg-mars-500 py-3 font-bold tracking-widest transition-colors text-xs flex justify-center items-center pointer-events-auto">
              CONTINUE
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (store.missionStatus === 'briefing') {
    return (
      <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center pointer-events-auto">
        <div className="game-hud-panel max-w-lg w-full flex flex-col gap-6 p-10 border border-mars-700">
          <div className="flex flex-col gap-2">
            <h3 className="text-neon-cyan font-mono tracking-widest text-sm">ASTRA-1</h3>
            <h2 className="text-3xl font-black tracking-widest text-mars-100">
              {levelId === 'level-1' ? 'OUTPOST DELTA' : levelId === 'level-2' ? 'HELIOS LAB' : 'BURIED SIGNAL'}
            </h2>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-mars-100 text-sm border-t border-b border-mars-900 py-6">
            <div className="flex justify-between">
              <span className="text-mars-400">STATUS:</span>
              <span className="text-mars-500 animate-pulse">CRITICAL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mars-400">COMMS:</span>
              <span className="text-mars-50">OFFLINE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mars-400">STORM:</span>
              <span className="text-mars-500">ACTIVE</span>
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-mars-400 font-bold mb-1">PRIMARY OBJECTIVE</span>
              <span className="text-emerald-400">
                {levelId === 'level-3' ? 'INVESTIGATE ANOMALY POINTS' : 'RESCUE COLONISTS'}
              </span>
              
              <span className="text-mars-400 font-bold mt-2 mb-1">SECONDARY OBJECTIVES</span>
              {levelId === 'level-2' && <span className="text-mars-50">RECOVER DATA TERMINALS</span>}
              <span className="text-mars-50">RESTORE {levelId === 'level-3' ? 'RELAY' : 'COMMUNICATIONS'}</span>
            </div>
          </div>
          
          <button 
            onClick={() => store.completeMission('active')} 
            className="w-full bg-mars-700 hover:bg-mars-500 py-4 font-black tracking-widest text-white transition-colors border border-mars-500"
          >
            [ DEPLOY ]
          </button>
        </div>
      </div>
    );
  }

  if (store.missionStatus !== 'active') return null;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="game-hud-panel border-l-4 border-l-mars-500 bg-black/80 backdrop-blur pointer-events-auto p-4 flex flex-col gap-1 min-w-[200px]">
          <h2 className="text-[10px] font-black tracking-[0.2em] text-mars-400">CURRENT OBJECTIVE</h2>
          
          {(() => {
            let currentObjective = '';
            let currentProgress = '';
            
            if (levelId === 'level-1') {
              if (store.colonistsRescued < store.colonistsTotal) {
                currentObjective = 'RESCUE COLONISTS';
                currentProgress = `${store.colonistsRescued} / ${store.colonistsTotal}`;
              } else if (!store.communicationsRestored) {
                currentObjective = 'RESTORE COMMUNICATIONS';
                currentProgress = 'OFFLINE';
              } else {
                currentObjective = 'OBJECTIVES COMPLETE';
                currentProgress = 'STANDBY';
              }
            } else if (levelId === 'level-2') {
              if (store.colonistsRescued < store.colonistsTotal) {
                currentObjective = 'LOCATE SCIENTISTS';
                currentProgress = `${store.colonistsRescued} / ${store.colonistsTotal}`;
              } else if (store.dataRecovered < store.dataTotal) {
                currentObjective = 'RECOVER DATA';
                currentProgress = `${store.dataRecovered} / ${store.dataTotal}`;
              } else if (!store.communicationsRestored) {
                currentObjective = 'RESTORE COMMUNICATIONS';
                currentProgress = 'OFFLINE';
              } else {
                currentObjective = 'OBJECTIVES COMPLETE';
                currentProgress = 'STANDBY';
              }
            } else if (levelId === 'level-3') {
              if (store.anomaliesInvestigated < store.anomaliesTotal) {
                currentObjective = 'INVESTIGATE ANOMALY';
                currentProgress = `${store.anomaliesInvestigated} / ${store.anomaliesTotal}`;
              } else if (!store.communicationsRestored) {
                currentObjective = 'RESTORE RELAY';
                currentProgress = 'OFFLINE';
              } else if (!store.astraFound) {
                currentObjective = 'LOCATE ASTRA';
                currentProgress = 'SIGNAL DETECTED';
              } else {
                currentObjective = 'OBJECTIVES COMPLETE';
                currentProgress = 'STANDBY';
              }
            }

            return (
              <>
                <span className={`font-mono text-sm tracking-wide ${currentObjective === 'OBJECTIVES COMPLETE' ? 'text-emerald-400' : 'text-mars-50'}`}>
                  {currentObjective}
                </span>
                <span className={`font-mono text-xs font-bold ${currentObjective === 'OBJECTIVES COMPLETE' ? 'text-emerald-400' : 'text-neon-cyan'}`}>
                  {currentProgress}
                </span>
              </>
            );
          })()}
        </div>

        <div className="game-hud-panel flex flex-col items-center gap-1 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Clock size={24} className={store.missionTimeLeft < 30 ? "text-mars-500 animate-pulse" : "text-mars-100"} />
            <span className={`text-2xl font-black tabular-nums tracking-widest ${store.missionTimeLeft < 30 ? "text-mars-500" : "text-mars-50"}`}>
              {Math.floor(store.missionTimeLeft / 60)}:{(store.missionTimeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-mars-300">STORM LEVEL</span>
            <div className="w-16 h-1.5 bg-black border border-mars-900 rounded overflow-hidden">
              <div 
                className={`h-full ${store.missionTimeLeft < 60 ? 'bg-mars-500 animate-pulse' : 'bg-mars-300'}`} 
                style={{ width: `${Math.min(100, Math.max(0, 100 - (store.missionTimeLeft / 300) * 100))}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="game-hud-panel flex items-center gap-3 pointer-events-auto">
          <Zap size={24} className="text-neon-cyan" />
          <span className="text-2xl font-black tabular-nums tracking-widest text-mars-50">
            {Math.floor(store.missionEnergy)} / {store.maxMissionEnergy}
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
          <div className="flex justify-center mt-2 gap-4 text-xs font-bold font-mono">
          <button 
            onClick={() => store.setDeploymentMode(store.deploymentMode === 'standard' ? null : 'standard')}
            className={`game-hud-panel border p-2 transition-colors ${store.deploymentMode === 'standard' ? 'bg-mars-700 border-mars-300' : 'hover:bg-mars-900 border-mars-700'}`}
          >
            <Zap className="inline mr-1 text-mars-300" size={14}/> STANDARD (10)
          </button>
          
          <button 
            onClick={() => store.setDeploymentMode(store.deploymentMode === 'repair' ? null : 'repair')}
            className={`game-hud-panel border p-2 transition-colors ${store.deploymentMode === 'repair' ? 'bg-mars-700 border-emerald-400' : 'hover:bg-mars-900 border-mars-700'}`}
          >
            <Zap className="inline mr-1 text-emerald-400" size={14}/> REPAIR (25)
          </button>

          <button 
            onClick={() => store.setDeploymentMode(store.deploymentMode === 'heavy' ? null : 'heavy')}
            className={`game-hud-panel border p-2 transition-colors ${store.deploymentMode === 'heavy' ? 'bg-mars-700 border-mars-100' : 'hover:bg-mars-900 border-mars-700'}`}
          >
            <Zap className="inline mr-1 text-mars-100" size={14}/> HEAVY (40)
          </button>

          <button 
            onClick={() => store.setDeploymentMode(store.deploymentMode === 'shield' ? null : 'shield')}
            className={`game-hud-panel border p-2 transition-colors ${store.deploymentMode === 'shield' ? 'bg-mars-700 border-neon-cyan' : 'hover:bg-mars-900 border-mars-700'}`}
          >
            <Zap className="inline mr-1 text-neon-cyan" size={14}/> SHIELD (30)
          </button>
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
