import Phaser from 'phaser';
import { useGameStore, Robot } from '../../game/simulation/gameState';
import { updateSimulation } from '../../game/simulation/systems/gameLoop';
import { getMissionConfig } from '../../game/content/missions';
import { PlayerController } from '../../game/entities/Player';

export default class GameScene extends Phaser.Scene {
  private player!: PlayerController;
  private robotsMap: Map<string, Phaser.Types.Physics.Arcade.SpriteWithDynamicBody> = new Map();
  private commStation!: Phaser.GameObjects.Sprite;
  private colonistsGroup!: Phaser.Physics.Arcade.Group;
  private interactKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data: { levelId: string }) {
    const config = getMissionConfig(data.levelId);
    
    // 1. Setup Environment
    this.physics.world.setBounds(0, 0, 1600, 1200);
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    
    if (data.levelId === 'level-1') {
      const bg = this.add.image(800, 600, 'mars_terrain');
      // Scale to fit 1600x1200 bounds approximately, keeping aspect ratio
      const scaleX = 1600 / bg.width;
      const scaleY = 1200 / bg.height;
      bg.setScale(Math.max(scaleX, scaleY));
      bg.setDepth(-10); // push it far back
    } else {
      this.cameras.main.setBackgroundColor('#2a0606'); // dark mars atmosphere
      
      // Draw procedural terrain craters/details only if no image
      for (let i = 0; i < 20; i++) {
        const rx = Phaser.Math.Between(0, 1600);
        const ry = Phaser.Math.Between(0, 1200);
        this.add.circle(rx, ry, Phaser.Math.Between(20, 80), 0x000000, 0.2).setDepth(-1);
      }
    }
    
    // Add obstacles (Mars rocks)
    const rocks = this.physics.add.staticGroup();
    for (let i = 0; i < 15; i++) {
      rocks.create(Phaser.Math.Between(100, 1500), Phaser.Math.Between(100, 1100), 'mars_rock');
    }

    // 2. Setup Player
    this.player = new PlayerController(this, 800, 600);
    this.cameras.main.startFollow(this.player.getSprite(), true, 0.05, 0.05);

    // Collisions
    this.physics.add.collider(this.player.getSprite(), rocks);

    // 3. Initialize level data into Zustand Simulation (Bridge)
    const store = useGameStore.getState();
    store.missionTimeLeft = config.timeLimit;
    store.colonistsTotal = config.totalColonists;
    store.missionStatus = 'active';
    store.communicationsRestored = false;
    store.colonistsRescued = 0;
    store.robots = {}; // Clear old
    
    config.initialRobots.forEach(robot => store.addRobot(robot));

    // 4. Visual Representations (Adapters)
    this.commStation = this.add.sprite(1200, 300, 'comm_station_offline').setDepth(5);
    this.physics.add.existing(this.commStation, true);
    this.physics.add.collider(this.player.getSprite(), this.commStation);

    this.colonistsGroup = this.physics.add.group();
    for (let i = 0; i < config.totalColonists; i++) {
      const col = this.colonistsGroup.create(
        Phaser.Math.Between(800, 1400),
        Phaser.Math.Between(200, 800),
        'colonist'
      );
      col.setDepth(5);
      this.physics.add.existing(col, true);
    }

    // 5. Setup Input
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    // Deployment Click Handler
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const store = useGameStore.getState();
      if (store.deploymentMode && store.missionStatus === 'active') {
        // pointer.worldX and pointer.worldY account for camera scroll
        store.deployRobot(store.deploymentMode, pointer.worldX, pointer.worldY);
      }
    });
  }

  update(time: number, delta: number) {
    const store = useGameStore.getState();

    updateSimulation(time, delta);

    if (store.missionStatus !== 'active') return;

    // Player Update
    this.player.update();

    // Interaction Check
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.handleInteract();
    }

    // Sync Visuals from Simulation State
    Object.values(store.robots).forEach((robot: Robot) => {
      let sprite = this.robotsMap.get(robot.id) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      
      if (robot.state === 'destroyed') {
        if (sprite) {
          // Explosion effect
          const emitter = this.add.particles(sprite.x, sprite.y, 'storm_particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            blendMode: 'ADD'
          });
          emitter.explode(20);
          sprite.destroy();
          this.robotsMap.delete(robot.id);
        }
        return;
      }

      if (!sprite) {
        let tex = 'robot_standard';
        if (robot.subType === 'repair') tex = 'robot_repair';
        if (robot.subType === 'heavy') tex = 'robot_heavy';
        if (robot.subType === 'shield') tex = 'robot_shield';

        sprite = this.physics.add.sprite(robot.x, robot.y, tex).setDepth(8);
        // Scale appropriately
        sprite.setScale(0.12);
        this.robotsMap.set(robot.id, sprite);
      }
      
      if (robot.state === 'rogue') {
        // Programmatic corruption effects
        sprite.setTint(0xff5555); // Reddish/purple tint
        if (Math.random() < 0.1) {
          sprite.setAlpha(Phaser.Math.FloatBetween(0.5, 1)); // flicker
        }
        
        // Simple wander/chase AI for rogue
        const p = this.player.getSprite();
        if (Phaser.Math.Distance.Between(sprite.x, sprite.y, p.x, p.y) < 300) {
          this.physics.moveToObject(sprite, p, 100);
        } else if (Math.random() < 0.05) {
           sprite.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
        }
      } else if (robot.type === 'friendly') {
        sprite.clearTint();
        sprite.setAlpha(1);
        const p = this.player.getSprite();
        if (Phaser.Math.Distance.Between(sprite.x, sprite.y, p.x, p.y) > 100) {
          this.physics.moveToObject(sprite, p, 150);
        } else {
          sprite.setVelocity(0);
        }
      }
    });

    // Handle Projectile Overlaps
    this.robotsMap.forEach((projSprite, projId) => {
      const projState = store.robots[projId];
      if (projState && projState.type === 'projectile' && projState.state !== 'destroyed') {
        this.robotsMap.forEach((targetSprite, targetId) => {
          const targetState = store.robots[targetId];
          if (projId !== targetId && targetState && targetState.state === 'rogue') {
            if (Phaser.Math.Distance.Between(projSprite.x, projSprite.y, targetSprite.x, targetSprite.y) < 30) {
              // HIT!
              store.damageRobot(targetId, 50); // Emp does 50 damage
              store.damageRobot(projId, 999); // Destroy projectile
            }
          }
        });
      }
    });

    // Storm particle effects (visual only, dense in certain areas)
    if (Math.random() < 0.3) {
      const px = this.cameras.main.scrollX + Phaser.Math.Between(0, 800);
      const py = this.cameras.main.scrollY + Phaser.Math.Between(0, 600);
      const particle = this.add.image(px, py, 'storm_particle').setAlpha(Phaser.Math.FloatBetween(0.3, 0.8)).setDepth(20);
      
      this.tweens.add({
        targets: particle,
        x: px - 100,
        y: py + 50,
        alpha: 0,
        duration: 2000,
        onComplete: () => particle.destroy()
      });
    }
  }

  handleInteract() {
    const store = useGameStore.getState();
    if (store.missionStatus !== 'active') return;
    const pSprite = this.player.getSprite();

    // Check Communications
    const distToComm = Phaser.Math.Distance.Between(pSprite.x, pSprite.y, this.commStation.x, this.commStation.y);
    if (distToComm < 80 && !store.communicationsRestored) {
      store.restoreCommunications();
      this.commStation.setTexture('comm_station_online');
      
      const text = this.add.text(this.commStation.x, this.commStation.y - 60, 'COMMS ONLINE', { color: '#22d3ee', fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5);
      this.tweens.add({ targets: text, y: text.y - 30, alpha: 0, duration: 2000, onComplete: () => text.destroy() });
      
      this.checkMissionComplete();
    }

    // Check Colonists Rescue
    this.colonistsGroup.getChildren().forEach((colonistObj: any) => {
      if (!colonistObj.active) return;
      const dist = Phaser.Math.Distance.Between(pSprite.x, pSprite.y, colonistObj.x, colonistObj.y);
      if (dist < 60) {
        colonistObj.setActive(false).setVisible(false);
        store.rescueColonist();
        
        const text = this.add.text(colonistObj.x, colonistObj.y - 20, 'RESCUED', { color: '#34d399', fontSize: '16px', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: text, y: text.y - 30, alpha: 0, duration: 1500, onComplete: () => text.destroy() });
        this.checkMissionComplete();
      }
    });
  }

  checkMissionComplete() {
    const store = useGameStore.getState();
    if (store.communicationsRestored && store.colonistsRescued === store.colonistsTotal) {
      store.completeMission('success');
    }
  }
}
