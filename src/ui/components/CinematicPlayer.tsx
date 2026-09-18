'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CinematicPlayer({ onComplete }: { onComplete: () => void }) {
  const [currentFrame, setCurrentFrame] = useState(0);

  const frames = [
    "YEAR 2047",
    "ASTRA-1 COLONY",
    "10,000 PEOPLE",
    "UNKNOWN ENERGY STORM",
    "COMMUNICATIONS OFFLINE",
    "AUTONOMOUS SYSTEM FAILURE",
    "ROBOTS GO ROGUE",
    "ASTRA SIGNAL LOST",
    "PLAYER IDENTIFICATION: ASTRA'S RIGHT HAND",
    "MISSION: FIND ASTRA"
  ];

  useEffect(() => {
    if (currentFrame < frames.length) {
      const timer = setTimeout(() => {
        setCurrentFrame(c => c + 1);
      }, 2000); // 2 seconds per text frame
      return () => clearTimeout(timer);
    } else {
      // Finished
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentFrame, frames.length, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute top-8 right-8 text-mars-100/50 hover:text-mars-100 font-bold tracking-[0.2em] text-sm transition-colors z-50"
      >
        SKIP CINEMATIC &gt;&gt;
      </button>

      {/* Cinematic Text Simulation */}
      <div className="relative w-full max-w-4xl h-64 flex items-center justify-center">
        {frames.map((text, index) => (
          <h2 
            key={index}
            className={`absolute text-4xl md:text-5xl font-black tracking-[0.2em] text-center transition-all duration-1000 ${
              index === currentFrame 
                ? 'opacity-100 scale-100 text-mars-50 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' 
                : 'opacity-0 scale-95 text-mars-700 blur-sm pointer-events-none'
            }`}
          >
            {text}
          </h2>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-12 w-64 h-1 bg-mars-950 rounded-full overflow-hidden">
        <div 
          className="h-full bg-mars-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(currentFrame / frames.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
