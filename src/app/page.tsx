'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CinematicPlayer from '../ui/components/CinematicPlayer';

export default function MainMenu() {
  const [showCinematic, setShowCinematic] = useState(true);
  const [profile, setProfile] = useState({ batteries: 0, colonySupport: 0 });

  useEffect(() => {
    // Check local storage so we don't play cinematic every single time they return to menu
    const hasSeenIntro = localStorage.getItem('astra_intro_seen');
    if (hasSeenIntro) {
      setShowCinematic(false);
    }

    // Mock fetch profile
    setProfile({ batteries: 1500, colonySupport: 42 });
  }, []);

  const handleCinematicComplete = () => {
    localStorage.setItem('astra_intro_seen', 'true');
    setShowCinematic(false);
  };

  if (showCinematic) {
    return <CinematicPlayer onComplete={handleCinematicComplete} />;
  }

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none">
      {/* Background Storm Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-mars-950 via-black to-black opacity-80" />
      
      {/* Atmospheric Particles (CSS placeholder) */}
      <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] animate-pulse" />
      
      <div className="z-10 flex flex-col items-center gap-12 w-full max-w-4xl px-8">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-mars-100 via-mars-500 to-mars-900 tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]">
            ASTRA-1
          </h1>
          <h2 className="text-xl md:text-3xl font-bold tracking-[0.5em] text-storm-400 storm-glow">
            MARS CRISIS
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-64 mt-8">
          <Link 
            href="/missions"
            className="game-hud-panel text-center py-4 text-mars-50 font-black tracking-[0.2em] hover:bg-mars-700 hover:scale-105 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]"
          >
            MISSIONS
          </Link>
          <button className="game-hud-panel text-center py-4 text-mars-100 font-bold tracking-[0.2em] hover:bg-mars-900 transition-colors opacity-70 hover:opacity-100">
            UPGRADES
          </button>
          <button className="game-hud-panel text-center py-4 text-mars-100 font-bold tracking-[0.2em] hover:bg-mars-900 transition-colors opacity-70 hover:opacity-100">
            STORY
          </button>
        </div>

        {/* Player Stats Footer */}
        <div className="absolute bottom-8 flex gap-12 game-hud-panel px-12 py-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-mars-100 font-bold tracking-widest mb-1">BATTERIES</span>
            <span className="text-xl font-black text-neon-cyan text-glow-cyan">{profile.batteries}</span>
          </div>
          <div className="w-px bg-mars-700/50" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-mars-100 font-bold tracking-widest mb-1">SUPPORT</span>
            <span className="text-xl font-black text-emerald-400">{profile.colonySupport}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
