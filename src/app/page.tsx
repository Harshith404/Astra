import Link from 'next/link';
import { fetchPlayerProfile } from '../lib/supabaseClient';

export default async function MainMenu() {
  // Mock fetching player profile (server-side)
  const profile = await fetchPlayerProfile('mock-user-123');

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Background Storm Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-mars-950 via-black to-black opacity-80" />
      
      <div className="z-10 flex flex-col items-center gap-12 w-full max-w-4xl px-8">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-mars-100 to-mars-700 tracking-tighter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            ASTRA-1
          </h1>
          <h2 className="text-xl md:text-2xl font-bold tracking-[0.5em] text-storm-400 storm-glow">
            MARS CRISIS
          </h2>
        </div>

        {/* Player Stats */}
        <div className="flex gap-8 game-hud-panel w-full max-w-lg justify-center">
          <div className="flex flex-col items-center">
            <span className="text-xs text-mars-100 font-bold tracking-widest">BATTERIES</span>
            <span className="text-2xl font-black text-neon-cyan text-glow-cyan">{profile.batteries}</span>
          </div>
          <div className="w-px bg-mars-700/50" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-mars-100 font-bold tracking-widest">COLONY SUPPORT</span>
            <span className="text-2xl font-black text-emerald-400">{profile.colonySupport}</span>
          </div>
        </div>

        {/* Level Select */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Link 
            href="/game/level-1"
            className="group relative flex flex-col p-6 rounded-xl border-2 border-mars-700 bg-mars-950/50 hover:bg-mars-900/80 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
          >
            <span className="text-mars-500 font-black tracking-widest text-sm mb-2 group-hover:text-mars-100 transition-colors">SECTOR 1</span>
            <span className="text-2xl font-bold text-mars-50 mb-1">Outpost Delta</span>
            <span className="text-xs text-mars-100 font-mono">STATUS: UNKNOWN</span>
            
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-mars-500 animate-pulse" />
          </Link>
          
          <div className="flex flex-col p-6 rounded-xl border-2 border-mars-900 bg-black/50 opacity-50 cursor-not-allowed">
            <span className="text-mars-900 font-black tracking-widest text-sm mb-2">SECTOR 2</span>
            <span className="text-2xl font-bold text-mars-100 mb-1">Hydro Station</span>
            <span className="text-xs text-mars-900 font-mono">STATUS: LOCKED</span>
          </div>

          <div className="flex flex-col p-6 rounded-xl border-2 border-mars-900 bg-black/50 opacity-50 cursor-not-allowed">
            <span className="text-mars-900 font-black tracking-widest text-sm mb-2">SECTOR 3</span>
            <span className="text-2xl font-bold text-mars-100 mb-1">Main Reactor</span>
            <span className="text-xs text-mars-900 font-mono">STATUS: LOCKED</span>
          </div>
        </div>
      </div>
    </main>
  );
}
