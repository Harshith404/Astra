import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Generate better stylized procedural graphics
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // --- Player (Operative) ---
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillEllipse(16, 28, 24, 10); // Shadow
    graphics.fillStyle(0x1e293b, 1); // slate-800 suit
    graphics.fillRoundedRect(6, 4, 20, 24, 6);
    graphics.fillStyle(0x38bdf8, 1); // cyan neon visor
    graphics.fillRect(10, 8, 16, 6);
    graphics.fillStyle(0x0f172a, 1); // Backpack
    graphics.fillRect(4, 8, 4, 14);
    graphics.lineStyle(2, 0x475569);
    graphics.strokeRoundedRect(6, 4, 20, 24, 6);
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

    // --- Scout Robot ---
    graphics.fillStyle(0x475569, 1);
    graphics.beginPath(); graphics.moveTo(16, 0); graphics.lineTo(32, 32); graphics.lineTo(0, 32); graphics.fillPath();
    graphics.fillStyle(0x22d3ee, 1); graphics.fillCircle(16, 20, 6);
    graphics.generateTexture('enemy_scout', 32, 32);
    graphics.clear();

    // --- Gunner Robot ---
    graphics.fillStyle(0x334155, 1);
    graphics.fillRoundedRect(4, 4, 24, 24, 4);
    graphics.fillStyle(0x94a3b8, 1);
    graphics.fillRect(28, 14, 12, 4); // Weapon
    graphics.fillStyle(0x22d3ee, 1); graphics.fillRect(12, 10, 8, 4);
    graphics.generateTexture('enemy_gunner', 40, 32);
    graphics.clear();

    // --- Heavy Robot ---
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRoundedRect(0, 0, 48, 48, 8);
    graphics.lineStyle(4, 0x64748b); graphics.strokeRoundedRect(0, 0, 48, 48, 8);
    graphics.fillStyle(0x22d3ee, 1); graphics.fillCircle(24, 24, 8);
    graphics.generateTexture('enemy_heavy', 48, 48);
    graphics.clear();

    // --- Rogue Variant Effects ---
    // (We will apply tints in GameScene to these base textures)

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
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(0, 0, 16, 4, 2);
    graphics.fillStyle(0x38bdf8, 0.5);
    graphics.fillRoundedRect(-2, -2, 20, 8, 4);
    graphics.generateTexture('projectile', 16, 8);
    graphics.clear();
    
    // --- L1 Props: Habitat Module ---
    graphics.fillStyle(0xc2410c, 1); // Mars rust orange
    graphics.fillRoundedRect(0, 0, 120, 80, 10);
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRect(10, 10, 100, 20); // Window
    graphics.lineStyle(2, 0x000000); graphics.strokeRoundedRect(0, 0, 120, 80, 10);
    graphics.generateTexture('habitat_module', 120, 80);
    graphics.clear();

    // --- L1 Props: Storage Crate ---
    graphics.fillStyle(0xd97706, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.lineStyle(3, 0x78350f);
    graphics.beginPath(); graphics.moveTo(0,0); graphics.lineTo(40,40); graphics.moveTo(40,0); graphics.lineTo(0,40); graphics.strokePath();
    graphics.strokeRect(0,0,40,40);
    graphics.generateTexture('storage_crate', 40, 40);
    graphics.clear();

    // --- L2 Props: Lab Terminal ---
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRoundedRect(0, 0, 60, 40, 4);
    graphics.fillStyle(0x22d3ee, 0.8);
    graphics.fillRect(5, 5, 50, 20); // Screen
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(10, 10, 20, 2); graphics.fillRect(10, 15, 30, 2);
    graphics.generateTexture('lab_terminal', 60, 40);
    graphics.clear();

    // --- L2 Props: Specimen Tube ---
    graphics.fillStyle(0x94a3b8, 1);
    graphics.fillRect(0, 0, 40, 10); graphics.fillRect(0, 70, 40, 10);
    graphics.fillStyle(0x38bdf8, 0.3); // Glass
    graphics.fillRect(5, 10, 30, 60);
    graphics.fillStyle(0xef4444, 0.6); // Specimen inside
    graphics.fillCircle(20, 40, 10);
    graphics.generateTexture('specimen_tube', 40, 80);
    graphics.clear();

    // --- L3 Props: Alien Energy Pillar ---
    graphics.fillStyle(0x020617, 1);
    graphics.fillRect(10, 0, 40, 100);
    graphics.fillStyle(0xa855f7, 0.8); // Purple glow core
    graphics.fillRect(20, 10, 20, 80);
    graphics.lineStyle(2, 0xd8b4fe);
    graphics.strokeRect(20, 10, 20, 80);
    graphics.generateTexture('energy_pillar', 60, 100);
    graphics.clear();

    // --- L3 Props: Anomaly Marker ---
    graphics.fillStyle(0x7e22ce, 1);
    graphics.beginPath(); graphics.moveTo(20,0); graphics.lineTo(40,20); graphics.lineTo(20,40); graphics.lineTo(0,20); graphics.fillPath();
    graphics.fillStyle(0xd8b4fe, 1);
    graphics.fillCircle(20, 20, 5);
    graphics.generateTexture('anomaly', 40, 40);
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
