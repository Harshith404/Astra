import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Generate placeholder graphics for our entities
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Player
    graphics.fillStyle(0x22d3ee, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();

    // Friendly Robot
    graphics.fillStyle(0x34d399, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('friendly_robot', 32, 32);
    graphics.clear();

    // Rogue Robot
    graphics.fillStyle(0xef4444, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.lineStyle(2, 0xffa500, 1);
    graphics.strokeCircle(16, 16, 16);
    graphics.generateTexture('rogue_robot', 32, 32);
    graphics.clear();

    // Colonist
    graphics.fillStyle(0xfef08a, 1);
    graphics.fillRect(0, 0, 16, 24);
    graphics.generateTexture('colonist', 16, 24);
    graphics.clear();

    // Communication Station
    graphics.fillStyle(0x94a3b8, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0x3b82f6, 1);
    graphics.fillCircle(32, 16, 8);
    graphics.generateTexture('comm_station', 64, 64);
    graphics.clear();

    // Storm Particle
    graphics.fillStyle(0xc084fc, 0.5);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('storm_particle', 8, 8);
    graphics.clear();
  }

  create() {
    // We can pass the levelId via the scene data later
    this.scene.start('GameScene', { levelId: 'level-1' });
  }
}
