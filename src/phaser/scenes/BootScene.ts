import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Generate better stylized procedural graphics
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // --- Player (Operative) ---
    // Body
    graphics.fillStyle(0x1e293b, 1); // slate-800 suit
    graphics.fillRoundedRect(4, 4, 24, 24, 6);
    // Visor
    graphics.fillStyle(0x22d3ee, 1); // cyan neon visor
    graphics.fillRoundedRect(8, 8, 16, 8, 2);
    // Backpack/details
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRect(6, 0, 20, 6);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();

    // --- Friendly Robot (Repair Drone) ---
    // Base
    graphics.fillStyle(0x334155, 1);
    graphics.fillCircle(16, 16, 14);
    // Glow core
    graphics.fillStyle(0x34d399, 1); // emerald glow
    graphics.fillCircle(16, 16, 6);
    // Antenna
    graphics.lineStyle(2, 0x94a3b8);
    graphics.beginPath();
    graphics.moveTo(16, 16);
    graphics.lineTo(24, 4);
    graphics.strokePath();
    graphics.generateTexture('friendly_robot', 32, 32);
    graphics.clear();

    // --- Rogue Robot ---
    // Base
    graphics.fillStyle(0x450a0a, 1);
    graphics.fillCircle(16, 16, 14);
    // Corruption core
    graphics.fillStyle(0xef4444, 1); // red aggressive
    graphics.fillCircle(16, 16, 8);
    // Spikes/armor
    graphics.lineStyle(3, 0xf97316);
    graphics.strokeCircle(16, 16, 16);
    graphics.generateTexture('rogue_robot', 32, 32);
    graphics.clear();

    // --- Colonist (Trapped) ---
    // Body (orange emergency suit)
    graphics.fillStyle(0xf97316, 1);
    graphics.fillRoundedRect(0, 0, 20, 28, 4);
    // Broken Visor
    graphics.fillStyle(0x64748b, 1);
    graphics.fillRect(2, 4, 16, 8);
    graphics.generateTexture('colonist', 20, 28);
    graphics.clear();

    // --- Communication Station ---
    // Platform
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRect(0, 0, 80, 80);
    // Dish Base
    graphics.fillStyle(0x334155, 1);
    graphics.fillCircle(40, 40, 30);
    // Dish Center
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillCircle(40, 40, 10);
    // Offline indicator (red)
    graphics.fillStyle(0xef4444, 1);
    graphics.fillCircle(40, 40, 4);
    graphics.generateTexture('comm_station_offline', 80, 80);
    graphics.clear();

    // Online indicator (cyan)
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.fillStyle(0x334155, 1);
    graphics.fillCircle(40, 40, 30);
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillCircle(40, 40, 10);
    graphics.fillStyle(0x22d3ee, 1);
    graphics.fillCircle(40, 40, 4);
    // Emit rings
    graphics.lineStyle(2, 0x22d3ee, 0.5);
    graphics.strokeCircle(40, 40, 20);
    graphics.strokeCircle(40, 40, 35);
    graphics.generateTexture('comm_station_online', 80, 80);
    graphics.clear();

    // --- Storm Particle ---
    graphics.fillStyle(0xc084fc, 0.6); // Purple storm
    graphics.fillCircle(8, 8, 8);
    graphics.fillStyle(0xec4899, 0.3); // Pink core
    graphics.fillCircle(8, 8, 4);
    graphics.generateTexture('storm_particle', 16, 16);
    graphics.clear();

    // --- Projectile (EMP/Laser) ---
    graphics.fillStyle(0x22d3ee, 1);
    graphics.fillRect(0, 0, 12, 4);
    graphics.generateTexture('projectile', 12, 4);
    graphics.clear();
    
    // --- Ground Tile / Obstacle ---
    graphics.fillStyle(0x450a0a, 1); // Dark red Mars rock
    graphics.fillRoundedRect(0, 0, 64, 64, 8);
    graphics.lineStyle(2, 0x7f1d1d, 1);
    graphics.strokeRoundedRect(0, 0, 64, 64, 8);
    graphics.generateTexture('mars_rock', 64, 64);
    graphics.clear();

    this.load.image('mars_terrain', '/assets/mars_terrain.jpg');
    this.load.image('robot_standard', '/assets/robots/robot-standard.png');
    this.load.image('robot_repair', '/assets/robots/robot-repair.png');
    this.load.image('robot_heavy', '/assets/robots/robot-heavy.png');
    this.load.image('robot_shield', '/assets/robots/robot-shield.png');
  }

  create() {
    const levelId = this.registry.get('levelId') || 'level-1';
    this.scene.start('GameScene', { levelId });
  }
}
