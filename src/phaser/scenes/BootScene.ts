import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load player
    this.load.svg('player', '/assets/player/player.svg', { width: 64, height: 64 });
    
    // Load enemies
    this.load.svg('enemy_scout', '/assets/enemies/scout.svg', { width: 64, height: 64 });
    this.load.svg('enemy_gunner', '/assets/enemies/gunner.svg', { width: 64, height: 64 });
    this.load.svg('enemy_heavy', '/assets/enemies/heavy.svg', { width: 96, height: 96 });
    
    // Load environment props
    this.load.svg('habitat_module', '/assets/environment/mars/habitat.svg', { width: 200, height: 160 });
    this.load.svg('storage_crate', '/assets/environment/mars/crate.svg', { width: 64, height: 64 });
    this.load.svg('lab_terminal', '/assets/environment/lab/terminal.svg', { width: 80, height: 64 });
    this.load.svg('specimen_tube', '/assets/environment/lab/specimen.svg', { width: 64, height: 128 });
    this.load.svg('energy_pillar', '/assets/environment/buried-signal/pillar.svg', { width: 64, height: 128 });
    this.load.svg('anomaly', '/assets/environment/buried-signal/anomaly.svg', { width: 64, height: 64 });
    
    // Load effects
    this.load.svg('projectile', '/assets/effects/projectile.svg', { width: 32, height: 16 });
    this.load.svg('spark', '/assets/effects/spark.svg', { width: 32, height: 32 });

    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Mars rock obstacle
    graphics.fillStyle(0x450a0a, 1);
    graphics.fillRoundedRect(0, 0, 64, 64, 8);
    graphics.lineStyle(2, 0x7f1d1d, 1);
    graphics.strokeRoundedRect(0, 0, 64, 64, 8);
    graphics.generateTexture('mars_rock', 64, 64);
    graphics.clear();

    // Storm particle (small glowing dot)
    graphics.fillStyle(0xfbbf24, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('storm_particle', 8, 8);
    graphics.clear();

    // Colonist (cyan circle person)
    graphics.fillStyle(0x22d3ee, 1);
    graphics.fillCircle(16, 16, 12);
    graphics.fillStyle(0xfef3c7, 1);
    graphics.fillCircle(16, 8, 6);
    graphics.generateTexture('colonist', 32, 32);
    graphics.clear();

    // Comm station (antenna tower shape)
    graphics.fillStyle(0x475569, 1);
    graphics.fillRect(12, 32, 8, 32);
    graphics.fillStyle(0xef4444, 1);
    graphics.fillTriangle(16, 0, 4, 32, 28, 32);
    graphics.lineStyle(2, 0xf87171, 1);
    graphics.strokeTriangle(16, 0, 4, 32, 28, 32);
    graphics.generateTexture('comm_station_offline', 32, 64);
    graphics.clear();

    // Comm station online (green)
    graphics.fillStyle(0x475569, 1);
    graphics.fillRect(12, 32, 8, 32);
    graphics.fillStyle(0x10b981, 1);
    graphics.fillTriangle(16, 0, 4, 32, 28, 32);
    graphics.generateTexture('comm_station_online', 32, 64);
    graphics.clear();

    // Data terminal (blue rectangle with screen)
    graphics.fillStyle(0x1e40af, 1);
    graphics.fillRoundedRect(0, 0, 48, 48, 6);
    graphics.fillStyle(0x60a5fa, 1);
    graphics.fillRect(6, 6, 36, 24);
    graphics.fillStyle(0x1d4ed8, 1);
    graphics.fillRect(6, 36, 36, 6);
    graphics.generateTexture('data_terminal', 48, 48);
    graphics.clear();

    // Astra Chamber (glowing purple orb)
    graphics.fillStyle(0x7c3aed, 0.8);
    graphics.fillCircle(32, 32, 28);
    graphics.lineStyle(3, 0xa78bfa, 1);
    graphics.strokeCircle(32, 32, 28);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(32, 32, 8);
    graphics.generateTexture('astra_chamber', 64, 64);
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
