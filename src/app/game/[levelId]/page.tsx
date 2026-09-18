'use client';

import dynamic from 'next/dynamic';
import GameHUD from '../../../ui/hud/GameHUD';

// We must dynamically import the Phaser game wrapper with SSR disabled
// because Phaser relies heavily on window/document browser APIs.
const PhaserGame = dynamic(() => import('../../../phaser/PhaserGame'), { ssr: false });

export default function GamePage({ params }: { params: { levelId: string } }) {
  return (
    <main className="relative w-screen h-screen bg-mars-950 overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-mars-900/40 via-mars-950 to-black pointer-events-none" />
      
      {/* Phaser Canvas Container */}
      <div className="absolute inset-0 z-0">
        <PhaserGame levelId={params.levelId} />
      </div>

      {/* DOM Overlay HUD */}
      <GameHUD />
    </main>
  );
}
