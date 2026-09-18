'use client';

import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle, Target, Users, Clock, ShieldAlert } from 'lucide-react';
import { fetchMissionProgress } from '../actions';
import { useEffect, useState } from 'react';
import { CAMPAIGN_MISSIONS, LevelConfig } from '../../game/content/missions';

export default function MissionsPage() {
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    fetchMissionProgress().then(setProgress);
  }, []);

  const getProgress = (id: string) => progress.find(p => p.mission_id === id);
  const isUnlocked = (id: string) => progress.some(p => p.mission_id === id && p.unlocked);

  // Snake layout for 7 missions
  const positions = [
    { left: '15%', top: '20%' }, // 1
    { left: '40%', top: '25%' }, // 2
    { left: '65%', top: '20%' }, // 3
    { left: '85%', top: '45%' }, // 4
    { left: '60%', top: '65%' }, // 5
    { left: '35%', top: '60%' }, // 6
    { left: '10%', top: '80%' }, // 7
  ];

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center select-none text-mars-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-mars-950 via-black to-black opacity-80" />
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-mars-100 hover:text-mars-50 transition-colors">
          <ArrowLeft size={24} />
          <span className="font-bold tracking-widest text-sm">BACK TO MENU</span>
        </Link>
        <h2 className="text-xl font-black tracking-[0.3em] text-mars-500">TACTICAL DEPLOYMENT</h2>
      </div>

      <div className="z-10 w-full h-full max-w-[1400px] relative mt-16 p-8">
        
        {/* Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {positions.map((pos, i) => {
            if (i === positions.length - 1) return null;
            const nextPos = positions[i + 1];
            const unlocked = isUnlocked(CAMPAIGN_MISSIONS[i + 1].id);
            return (
              <line 
                key={i}
                x1={pos.left} y1={pos.top} 
                x2={nextPos.left} y2={nextPos.top} 
                stroke={unlocked ? "#ef4444" : "#450a0a"} 
                strokeWidth="2" 
                strokeDasharray="5,5" 
                className={unlocked ? "opacity-80" : "opacity-30"} 
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {CAMPAIGN_MISSIONS.map((mission: LevelConfig, i) => {
          const unlocked = isUnlocked(mission.id);
          const prog = getProgress(mission.id);
          const completed = prog?.completed;
          const pos = positions[i];

          if (!unlocked) {
            return (
              <div key={mission.id} className="absolute z-10" style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}>
                <div className="flex flex-col items-center gap-2 opacity-40 cursor-not-allowed">
                  <div className="w-16 h-16 rounded-full border-2 border-mars-900 bg-black flex items-center justify-center shadow-lg">
                    <Lock size={20} className="text-mars-900" />
                  </div>
                  <span className="text-mars-900 font-bold tracking-widest text-xs text-center w-32">{mission.name}</span>
                </div>
              </div>
            );
          }

          return (
            <Link key={mission.id} href={`/game/${mission.id}`} className="absolute group z-20" style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]
                  ${completed ? 'border-mars-300 bg-mars-900' : 'border-mars-500 bg-mars-950/80 group-hover:bg-mars-800'}
                  group-hover:scale-110`}
                >
                  {completed ? (
                    <CheckCircle className="text-mars-300" size={32} />
                  ) : (
                    <span className="text-mars-50 font-black text-2xl">0{i + 1}</span>
                  )}
                  {!completed && <div className="absolute w-24 h-24 rounded-full border border-mars-500 animate-ping opacity-20" />}
                </div>
                
                <div className="game-hud-panel w-64 mt-2 absolute top-20 scale-0 group-hover:scale-100 origin-top transition-transform pointer-events-none z-50 bg-black/90 backdrop-blur-md">
                  <h3 className="text-mars-50 font-black text-sm mb-1 text-center tracking-[0.2em]">{mission.name}</h3>
                  <div className="w-full h-px bg-mars-700/50 mb-2" />
                  
                  <div className="text-[10px] text-mars-100 font-mono mb-2 text-center leading-tight opacity-80">
                    {mission.description}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-mars-100 font-mono items-center">
                      <span className="flex items-center gap-1"><ShieldAlert size={12}/> DIFFICULTY:</span>
                      <span className={`font-bold ${mission.difficulty === 'EXTREME' || mission.difficulty === 'ASTRA' ? 'text-neon-cyan animate-pulse' : 'text-mars-400'}`}>
                        {mission.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-mars-100 font-mono items-center">
                      <span className="flex items-center gap-1"><Users size={12}/> COLONISTS:</span>
                      <span className="font-bold text-mars-400">
                        {prog?.best_survivors || 0} / {mission.totalColonists}
                      </span>
                    </div>

                    <div className="flex justify-between text-[10px] text-mars-100 font-mono items-center">
                      <span className="flex items-center gap-1"><Target size={12}/> OBJECTIVE:</span>
                      <span className="font-bold text-mars-300 text-right max-w-[120px] truncate">
                        {mission.objectiveText}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-mars-300 font-bold tracking-widest text-xs text-center w-40 mt-1 drop-shadow-md">
                  {mission.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
