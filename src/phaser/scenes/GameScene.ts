import Phaser from 'phaser';
import { useGameStore, Robot } from '../../game/simulation/gameState';
import { updateSimulation } from '../../game/simulation/systems/gameLoop';
import { level1 } from '../../game/content/levels/level1';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private robotsMap: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private commStation!: Phaser.GameObjects.Sprite;
  private colonistsGroup!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data: { levelId: string }) {
    // 1. Setup Environment
    this.cameras.main.setBackgroundColor('#450a0a'); // mars-950

    // Add ground grid for tech feel
    const grid = this.add.grid(400, 300, 1600, 1200, 64, 64, 0x000000, 0, 0xef4444, 0.1);

    // 2. Setup Player
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    // 3. Initialize level data into Zustand Simulation (Bridge)
    const store = useGameStore.getState();
    store.missionTimeLeft = level1.timeLimit;
    store.colonistsTotal = level1.totalColonists;
    store.missionStatus = 'active';
    store.robots = {}; // Clear old
    
    level1.initialRobots.forEach(robot => {
      store.addRobot(robot);
    });

    // 4. Visual Representations (Adapters)
    this.commStation = this.add.sprite(600, 100, 'comm_station');
    this.physics.add.existing(this.commStation, true); // static

    this.colonistsGroup = this.physics.add.group();
    for (let i = 0; i < level1.totalColonists; i++) {
      const col = this.colonistsGroup.create(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(100, 500),
        'colonist'
      );
      this.physics.add.existing(col);
    }

    // 5. Setup Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      
      // Interact key
      this.input.keyboard.on('keydown-SPACE', this.handleInteract, this);
    }
  }

  update(time: number, delta: number) {
    const store = useGameStore.getState();

    // Run simulation loop (timer, corruption rules)
    updateSimulation(time, delta);

    if (store.missionStatus !== 'active') return;

    // Player Movement
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

    if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

    // Sync Visuals from Simulation State
    Object.values(store.robots).forEach((robot: Robot) => {
      let sprite = this.robotsMap.get(robot.id);
      if (!sprite) {
        sprite = this.add.sprite(robot.x, robot.y, robot.type === 'friendly' ? 'friendly_robot' : 'rogue_robot');
        this.robotsMap.set(robot.id, sprite);
      }
      
      // Update visual based on state
      if (robot.state === 'rogue') {
        sprite.setTexture('rogue_robot'); // Visual change for corruption
      } else if (robot.type === 'friendly') {
        sprite.setTexture('friendly_robot');
      }

      // Add simple wander behavior for rogue visual (Simulation should ideally own this, but for MVP doing simple visual logic)
      if (robot.state === 'rogue' && Math.random() < 0.02) {
         // simple jitter
         sprite.x += Phaser.Math.Between(-2, 2);
         sprite.y += Phaser.Math.Between(-2, 2);
      }
    });

    // Storm particle effects (visual only)
    if (Math.random() < 0.1) {
      this.add.image(
        this.cameras.main.scrollX + Phaser.Math.Between(0, 800),
        this.cameras.main.scrollY + Phaser.Math.Between(0, 600),
        'storm_particle'
      ).setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
    }
  }

  handleInteract() {
    const store = useGameStore.getState();
    if (store.missionStatus !== 'active') return;

    // Simple distance checks for MVP (Usually done via physics overlap)
    
    // Check Communications
    const distToComm = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.commStation.x, this.commStation.y);
    if (distToComm < 60 && !store.communicationsRestored) {
      store.restoreCommunications();
      
      // Visual feedback
      const text = this.add.text(this.commStation.x, this.commStation.y - 40, 'COMMS ONLINE', { color: '#22d3ee', fontSize: '16px' }).setOrigin(0.5);
      this.tweens.add({
        targets: text,
        y: text.y - 30,
        alpha: 0,
        duration: 2000,
        onComplete: () => text.destroy()
      });
      
      this.checkMissionComplete();
    }

    // Check Colonists Rescue
    this.colonistsGroup.getChildren().forEach((colonistObj: any) => {
      if (!colonistObj.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, colonistObj.x, colonistObj.y);
      if (dist < 40) {
        colonistObj.setActive(false).setVisible(false);
        store.rescueColonist();
        
        // Visual feedback
        const text = this.add.text(colonistObj.x, colonistObj.y - 20, '+1 RESCUED', { color: '#34d399', fontSize: '14px' }).setOrigin(0.5);
        this.tweens.add({
          targets: text,
          y: text.y - 20,
          alpha: 0,
          duration: 1500,
          onComplete: () => text.destroy()
        });

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
