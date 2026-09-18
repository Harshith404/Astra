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
