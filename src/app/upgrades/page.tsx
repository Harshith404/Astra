'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Shield, Plus, HeartPulse, Users } from 'lucide-react';
import { fetchProfile, fetchPlayerRobots } from '../actions';

export default function UpgradesPage() {
  const [profile, setProfile] = useState({ batteries: 0, colonySupport: 0 });
  const [robots, setRobots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [prof, robs] = await Promise.all([fetchProfile(), fetchPlayerRobots()]);
    setProfile(prof);
    setRobots(robs);
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => loadData(), 0);
  }, []);

  const handleUpgrade = async (robotType: string, currentLevel: number) => {
    const cost = currentLevel * 250;
    if (profile.batteries < cost) return;

    setUpgrading(robotType);
    try {
      const res = await fetch('/api/robots/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ robotType })
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
    setUpgrading(null);
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center select-none pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-mars-950 via-black to-black opacity-80" />
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-mars-100 hover:text-mars-50 transition-colors">
          <ArrowLeft size={24} />
          <span className="font-bold tracking-widest text-sm">BACK TO MENU</span>
        </Link>
        <div className="game-hud-panel flex items-center gap-6 px-6 py-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="font-black text-2xl">{profile.colonySupport || 0}</span>
              <Users size={24} />
            </div>
            <span className="text-[10px] font-bold text-mars-400 tracking-widest">SUPPORT</span>
          </div>
          <div className="w-px h-8 bg-mars-900" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-neon-cyan">
              <span className="font-black text-2xl">{profile.batteries || 0}</span>
              <Zap size={24} className="storm-glow" />
            </div>
            <span className="text-[10px] font-bold text-mars-400 tracking-widest">BATTERIES</span>
          </div>
        </div>
      </div>

      <div className="z-10 w-full max-w-5xl px-8 flex flex-col gap-6">
        <h1 className="text-4xl font-black text-mars-50 tracking-[0.2em] mb-4 shadow-[0_0_20px_rgba(239,68,68,0.3)]">ROBOTICS WING</h1>
        
        {loading ? (
          <div className="text-mars-500 font-bold tracking-widest animate-pulse">ACCESSING DATABASE...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {robots.map((robot) => {
              const cost = robot.level * 250;
              const canUpgrade = profile.batteries >= cost;
              return (
                <div key={robot.robot_type} className="game-hud-panel flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-mars-900 pb-2">
                    <h2 className="text-xl font-black text-mars-100 uppercase tracking-widest">
                      {robot.robot_type === 'friendly' ? 'STANDARD' : robot.robot_type === 'medic' ? 'REPAIR' : robot.robot_type === 'emp' ? 'SHIELD' : robot.robot_type} DRONE
                    </h2>
                    <span className="text-neon-cyan font-bold tracking-widest">LEVEL {robot.level}</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-mars-950 border border-mars-700 rounded flex items-center justify-center relative overflow-hidden">
                       <img 
                         src={`/assets/robots/robot-${robot.robot_type === 'friendly' ? 'standard' : robot.robot_type === 'medic' ? 'repair' : robot.robot_type === 'emp' ? 'shield' : robot.robot_type}.png`} 
                         alt={robot.robot_type} 
                         className="w-16 h-16 object-contain filter drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-mars-900/50 to-transparent mix-blend-overlay" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      <div className="flex justify-between items-center text-sm font-bold text-mars-50">
                         <span>HP & EFFICIENCY</span>
                         <span className="text-emerald-400">{Array(10).fill('█').map((c, i) => i < Math.min(10, 3 + robot.level) ? c : '░').join('')}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold text-mars-50">
                         <span>STORM RESIST</span>
                         <span className="text-neon-cyan">{Array(10).fill('█').map((c, i) => i < Math.min(10, 2 + robot.level * 2) ? c : '░').join('')}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleUpgrade(robot.robot_type, robot.level)}
                    disabled={!canUpgrade || upgrading === robot.robot_type}
                    className={`mt-2 py-3 rounded font-black tracking-[0.2em] transition-all flex items-center justify-center gap-2
                      ${canUpgrade 
                        ? 'bg-mars-700 hover:bg-mars-500 text-mars-50 border border-mars-500' 
                        : 'bg-black text-mars-700 border border-mars-900 cursor-not-allowed'}
                    `}
                  >
                    {upgrading === robot.robot_type ? 'UPGRADING...' : 'UPGRADE'}
                    {!upgrading && (
                      <span className={`text-xs ml-2 flex items-center gap-1 ${canUpgrade ? 'text-neon-cyan' : 'text-mars-900'}`}>
                        {cost} <Zap size={14} />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
