'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';

interface PhaserGameProps {
  levelId: string;
}

export default function PhaserGame({ levelId }: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current?.hasChildNodes()) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current!,
        width: 800,
        height: 600,
        backgroundColor: '#450a0a',
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scene: [BootScene, GameScene],
      };

      const newGame = new Phaser.Game(config);
      newGame.registry.set('levelId', levelId);
      setGame(newGame);

      return () => {
        newGame.destroy(true);
        setGame(null);
      };
    }
  }, []);

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div 
        ref={gameRef} 
        className="rounded-xl overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.3)] border-2 border-mars-700/50"
      />
    </div>
  );
}
