'use client';

import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { fetchMissionProgress } from '../actions';
import { useEffect, useState } from 'react';

export default function MissionsPage() {
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    fetchMissionProgress().then(setProgress);
  }, []);

  const isUnlocked = (id: string) => progress.some(p => p.mission_id === id && p.unlocked);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-mars-950 via-black to-black opacity-80" />
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-mars-100 hover:text-mars-50 transition-colors">
          <ArrowLeft size={24} />
          <span className="font-bold tracking-widest text-sm">BACK TO MENU</span>
        </Link>
        <h2 className="text-xl font-black tracking-[0.3em] text-mars-500">TACTICAL DEPLOYMENT</h2>
      </div>

      <div className="z-10 w-full max-w-6xl px-8 flex flex-col items-center">
        
        {/* Mission Graph Container */}
        <div className="relative w-full h-[600px] flex items-center justify-center">
          
          {/* Connection Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
            {/* Level 1 -> 2 */}
            <line x1="30%" y1="70%" x2="50%" y2="50%" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" className="opacity-50" />
            {/* Level 2 -> 3 */}
            <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="#7f1d1d" strokeWidth="2" strokeDasharray="5,5" />
          </svg>

          {/* LEVEL 3 (Locked) */}
          <div className="absolute" style={{ left: '60%', top: '20%' }}>
            <div className={`flex flex-col items-center gap-2 ${isUnlocked('level-3') ? '' : 'opacity-50 cursor-not-allowed'}`}>
              <div className="w-16 h-16 rounded-full border-2 border-mars-900 bg-black flex items-center justify-center">
                {isUnlocked('level-3') ? <span className="text-mars-900 font-bold">03</span> : <Lock size={20} className="text-mars-900" />}
              </div>
              <span className="text-mars-900 font-bold tracking-widest text-xs text-center w-32">COMM HUB</span>
            </div>
          </div>

          {/* LEVEL 2 (Locked) */}
          <div className="absolute" style={{ left: '42%', top: '40%' }}>
            <div className={`flex flex-col items-center gap-2 ${isUnlocked('level-2') ? '' : 'opacity-50 cursor-not-allowed'}`}>
              <div className="w-16 h-16 rounded-full border-2 border-mars-900 bg-black flex items-center justify-center">
                {isUnlocked('level-2') ? <span className="text-mars-900 font-bold">02</span> : <Lock size={20} className="text-mars-900" />}
              </div>
              <span className="text-mars-900 font-bold tracking-widest text-xs text-center w-32">RESEARCH LAB</span>
            </div>
          </div>

          {/* LEVEL 1 (Unlocked) */}
          {isUnlocked('level-1') ? (
            <Link href="/game/level-1" className="absolute group" style={{ left: '20%', top: '60%' }}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full border-4 border-mars-500 bg-mars-950/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-mars-900 transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <span className="text-mars-50 font-black text-xl">01</span>
                  <div className="absolute w-24 h-24 rounded-full border border-mars-500 animate-ping opacity-20" />
                </div>
                
                <div className="game-hud-panel w-48 mt-4 scale-95 group-hover:scale-100 transition-transform">
                  <h3 className="text-mars-50 font-bold text-sm mb-1 text-center">OUTPOST DELTA</h3>
                  <div className="w-full h-px bg-mars-700/50 mb-2" />
                  <div className="flex justify-between text-[10px] text-mars-100 font-mono">
                    <span>STATUS:</span>
                    <span className="text-mars-500 animate-pulse">CRITICAL</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-mars-100 font-mono mt-1">
                    <span>STORM:</span>
                    <span className="text-storm-400">MEDIUM</span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="absolute" style={{ left: '20%', top: '60%' }}>
              <div className="flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
                <div className="w-20 h-20 rounded-full border-2 border-mars-900 bg-black flex items-center justify-center">
                  <Lock size={20} className="text-mars-900" />
                </div>
                <span className="text-mars-900 font-bold tracking-widest text-xs text-center w-32">OUTPOST DELTA</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
