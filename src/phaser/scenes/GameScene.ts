import Phaser from 'phaser';
import { useGameStore, Robot } from '../../game/simulation/gameState';
import { updateSimulation } from '../../game/simulation/systems/gameLoop';
import { level1 } from '../../game/content/levels/level1';
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
    // 1. Setup Environment (Wider bounds)
    this.physics.world.setBounds(0, 0, 1600, 1200);
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    this.cameras.main.setBackgroundColor('#2a0606'); // dark mars atmosphere

    // Draw terrain craters/details
    for (let i = 0; i < 20; i++) {
      const rx = Phaser.Math.Between(0, 1600);
      const ry = Phaser.Math.Between(0, 1200);
      this.add.circle(rx, ry, Phaser.Math.Between(20, 80), 0x000000, 0.2);
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
    store.missionTimeLeft = level1.timeLimit;
    store.colonistsTotal = level1.totalColonists;
    store.missionStatus = 'active';
    store.communicationsRestored = false;
    store.colonistsRescued = 0;
    store.robots = {}; // Clear old
    
    level1.initialRobots.forEach(robot => store.addRobot(robot));

    // 4. Visual Representations (Adapters)
    this.commStation = this.add.sprite(1200, 300, 'comm_station_offline').setDepth(5);
    this.physics.add.existing(this.commStation, true);
    this.physics.add.collider(this.player.getSprite(), this.commStation);

    this.colonistsGroup = this.physics.add.group();
    for (let i = 0; i < level1.totalColonists; i++) {
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
        const tex = robot.type === 'projectile' ? 'projectile' : (robot.type === 'friendly' ? 'friendly_robot' : 'rogue_robot');
        sprite = this.physics.add.sprite(robot.x, robot.y, tex).setDepth(8);
        this.robotsMap.set(robot.id, sprite);
        
        if (robot.type === 'projectile') {
          // Find nearest rogue target
          let nearest: Phaser.GameObjects.Sprite | null = null;
          let minDist = Infinity;
          this.robotsMap.forEach((s, id) => {
            const r = store.robots[id];
            if (r && r.state === 'rogue') {
              const d = Phaser.Math.Distance.Between(sprite.x, sprite.y, s.x, s.y);
              if (d < minDist) { minDist = d; nearest = s; }
            }
          });
          
          if (nearest) {
            this.physics.moveToObject(sprite, nearest, 400);
            sprite.setRotation(Math.atan2(nearest.y - sprite.y, nearest.x - sprite.x));
          } else {
             sprite.setVelocity(400, 0); // fallback
          }

          // Handle collision with ANY robot (in update loop we'll check overlap)
        }
      }
      
      if (robot.type !== 'projectile') {
        if (robot.state === 'rogue') {
          sprite.setTexture('rogue_robot');
          // Simple wander/chase AI for rogue MVP
          const p = this.player.getSprite();
          if (Phaser.Math.Distance.Between(sprite.x, sprite.y, p.x, p.y) < 300) {
            this.physics.moveToObject(sprite, p, 100);
          } else if (Math.random() < 0.05) {
             sprite.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
          }
        } else if (robot.type === 'friendly') {
          sprite.setTexture('friendly_robot');
          const p = this.player.getSprite();
          if (Phaser.Math.Distance.Between(sprite.x, sprite.y, p.x, p.y) > 100) {
            this.physics.moveToObject(sprite, p, 150);
          } else {
            sprite.setVelocity(0);
          }
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
