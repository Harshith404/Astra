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
  private dataTerminalsGroup!: Phaser.Physics.Arcade.Group;
  private anomaliesGroup!: Phaser.Physics.Arcade.Group;
  private astraChamber!: Phaser.GameObjects.Sprite;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private deployPreview!: Phaser.GameObjects.Sprite;
  private deployRadius!: Phaser.GameObjects.Graphics;

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
    store.dataTotal = data.levelId === 'level-2' ? 3 : 0;
    store.anomaliesTotal = data.levelId === 'level-3' ? 3 : 0;
    store.missionStatus = 'active';
    store.communicationsRestored = false;
    store.colonistsRescued = 0;
    store.dataRecovered = 0;
    store.anomaliesInvestigated = 0;
    store.astraFound = false;
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

    this.dataTerminalsGroup = this.physics.add.group();
    if (data.levelId === 'level-2') {
      for (let i = 0; i < store.dataTotal; i++) {
        const term = this.dataTerminalsGroup.create(Phaser.Math.Between(400, 1200), Phaser.Math.Between(300, 900), 'data_terminal');
        term.setDepth(5).setTint(0x4299e1);
        this.physics.add.existing(term, true);
      }
    }

    this.anomaliesGroup = this.physics.add.group();
    if (data.levelId === 'level-3') {
      for (let i = 0; i < store.anomaliesTotal; i++) {
        const anomaly = this.anomaliesGroup.create(Phaser.Math.Between(300, 1300), Phaser.Math.Between(300, 900), 'anomaly');
        anomaly.setDepth(5).setTint(0xa855f7).setAlpha(0.8);
        this.physics.add.existing(anomaly, true);
      }
      this.astraChamber = this.add.sprite(1400, 1000, 'astra_chamber').setDepth(5).setTint(0x22d3ee).setVisible(false);
      this.physics.add.existing(this.astraChamber, true);
      
      // Hide comm station initially
      this.commStation.setVisible(false);
    }

    // 5. Setup Input
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    // Deployment Previews
    this.deployPreview = this.add.sprite(0, 0, 'robot_standard').setAlpha(0.5).setDepth(20).setVisible(false).setScale(0.12);
    this.deployRadius = this.add.graphics().setDepth(19).setVisible(false);

    // Deployment Click Handler
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const store = useGameStore.getState();
      if (store.deploymentMode && store.missionStatus === 'active') {
        // pointer.worldX and pointer.worldY account for camera scroll
        // Play pulse effect
        const pulse = this.add.graphics();
        pulse.lineStyle(4, 0x22d3ee, 1);
        pulse.strokeCircle(pointer.worldX, pointer.worldY, 10);
        pulse.setDepth(18);
        this.tweens.add({
          targets: pulse,
          scale: 3,
          alpha: 0,
          duration: 400,
          onComplete: () => pulse.destroy()
        });
        
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

    // Contextual interaction prompts
    let canInteract = false;
    let promptText = '';

    const p = this.player.getSprite();
    
    // Check Comm station
    if (this.commStation.visible && !store.communicationsRestored && Phaser.Math.Distance.Between(p.x, p.y, this.commStation.x, this.commStation.y) < 80) {
      canInteract = true;
      promptText = store.anomaliesTotal > 0 ? '[SPACE] RESTORE RELAY' : '[SPACE] RESTORE COMMUNICATIONS';
    } 
    // Check Astra Chamber
    else if (this.astraChamber?.visible && !store.astraFound && Phaser.Math.Distance.Between(p.x, p.y, this.astraChamber.x, this.astraChamber.y) < 80) {
      canInteract = true;
      promptText = '[SPACE] LOCATE ASTRA';
    } else {
      // Check colonists
      let foundInteractable = false;
      this.colonistsGroup.getChildren().forEach((c: any) => {
        if (!foundInteractable && c.active && Phaser.Math.Distance.Between(p.x, p.y, c.x, c.y) < 50) {
          canInteract = true; promptText = '[SPACE] RESCUE COLONIST'; foundInteractable = true;
        }
      });

      if (!foundInteractable) {
        this.dataTerminalsGroup.getChildren().forEach((t: any) => {
          if (!foundInteractable && t.active && Phaser.Math.Distance.Between(p.x, p.y, t.x, t.y) < 60) {
            canInteract = true; promptText = '[SPACE] DOWNLOAD DATA'; foundInteractable = true;
          }
        });
      }

      if (!foundInteractable) {
        this.anomaliesGroup.getChildren().forEach((a: any) => {
          if (!foundInteractable && a.active && Phaser.Math.Distance.Between(p.x, p.y, a.x, a.y) < 60) {
            canInteract = true; promptText = '[SPACE] INVESTIGATE ANOMALY'; foundInteractable = true;
          }
        });
      }
    }

    if (canInteract) {
      this.player.showPrompt(promptText);
    } else {
      this.player.hidePrompt();
    }

    // Interaction Check
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.handleInteract();
    }

    // Deployment preview logic
    if (store.deploymentMode) {
      const pointer = this.input.activePointer;
      this.deployPreview.setPosition(pointer.worldX, pointer.worldY);
      this.deployPreview.setVisible(true);
      
      let tex = 'robot_standard';
      let radius = 100;
      let color = 0x22d3ee;
      if (store.deploymentMode === 'repair') { tex = 'robot_repair'; color = 0x10b981; }
      if (store.deploymentMode === 'heavy') { tex = 'robot_heavy'; }
      if (store.deploymentMode === 'shield') { tex = 'robot_shield'; radius = 150; color = 0xa855f7; }
      
      this.deployPreview.setTexture(tex);
      
      this.deployRadius.clear();
      this.deployRadius.lineStyle(1, color, 0.4);
      this.deployRadius.fillStyle(color, 0.1);
      this.deployRadius.fillCircle(pointer.worldX, pointer.worldY, radius);
      this.deployRadius.strokeCircle(pointer.worldX, pointer.worldY, radius);
      this.deployRadius.setVisible(true);
    } else {
      this.deployPreview.setVisible(false);
      this.deployRadius.setVisible(false);
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
    if (this.commStation.visible) {
      const distToComm = Phaser.Math.Distance.Between(pSprite.x, pSprite.y, this.commStation.x, this.commStation.y);
      if (distToComm < 80 && !store.communicationsRestored) {
        store.restoreCommunications();
        this.commStation.setTexture('comm_station_online');
        
        const text = this.add.text(this.commStation.x, this.commStation.y - 60, store.anomaliesTotal > 0 ? 'SIGNAL ACQUIRED' : 'COMMS ONLINE', { color: '#22d3ee', fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: text, y: text.y - 30, alpha: 0, duration: 2000, onComplete: () => text.destroy() });
        
        if (store.anomaliesTotal > 0) {
          this.astraChamber.setVisible(true); // Reveal Astra
        }
        
        this.checkMissionComplete();
        return; // Prioritize this interaction
      }
    }

    // Check Astra
    if (this.astraChamber?.visible && !store.astraFound) {
      if (Phaser.Math.Distance.Between(pSprite.x, pSprite.y, this.astraChamber.x, this.astraChamber.y) < 80) {
        store.findAstra();
        const text = this.add.text(this.astraChamber.x, this.astraChamber.y - 60, 'ASTRA SIGNAL LOCKED. SHE IS ALIVE.', { color: '#a855f7', fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: text, y: text.y - 30, alpha: 0, duration: 3000, onComplete: () => text.destroy() });
        this.checkMissionComplete();
        return;
      }
    }

    // Check Data
    this.dataTerminalsGroup.getChildren().forEach((termObj: any) => {
      if (!termObj.active) return;
      if (Phaser.Math.Distance.Between(pSprite.x, pSprite.y, termObj.x, termObj.y) < 60) {
        termObj.setActive(false).setTint(0x718096);
        store.recoverData();
        const text = this.add.text(termObj.x, termObj.y - 20, 'DATA RECOVERED', { color: '#4299e1', fontSize: '16px', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: text, y: text.y - 30, alpha: 0, duration: 1500, onComplete: () => text.destroy() });
        this.checkMissionComplete();
      }
    });

    // Check Anomalies
    this.anomaliesGroup.getChildren().forEach((anomObj: any) => {
      if (!anomObj.active) return;
      if (Phaser.Math.Distance.Between(pSprite.x, pSprite.y, anomObj.x, anomObj.y) < 60) {
        anomObj.setActive(false).setTint(0x718096).setAlpha(0.3);
        store.investigateAnomaly();
        const text = this.add.text(anomObj.x, anomObj.y - 20, 'ANALYSIS COMPLETE', { color: '#a855f7', fontSize: '16px', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: text, y: text.y - 30, alpha: 0, duration: 1500, onComplete: () => text.destroy() });
        
        if (store.anomaliesInvestigated === store.anomaliesTotal) {
          this.commStation.setVisible(true); // Reveal Relay
        }
        
        this.checkMissionComplete();
      }
    });

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
    
    let complete = false;
    
    if (store.anomaliesTotal > 0) {
      // Level 3
      if (store.astraFound) {
        complete = true;
      }
    } else if (store.dataTotal > 0) {
      // Level 2
      if (store.communicationsRestored && store.colonistsRescued === store.colonistsTotal && store.dataRecovered === store.dataTotal) {
        complete = true;
      }
    } else {
      // Level 1
      if (store.communicationsRestored && store.colonistsRescued === store.colonistsTotal) {
        complete = true;
      }
    }

    if (complete && store.missionStatus === 'active') {
      store.missionStatus = 'success'; // prevent multiple triggers
      
      // Dramatic flash
      this.cameras.main.flash(1000, 255, 255, 255);
      const text = this.add.text(800, 400, 'MISSION COMPLETE', { color: '#ffffff', fontSize: '64px', fontStyle: 'black' }).setOrigin(0.5).setDepth(100);
      text.setScrollFactor(0);
      
      setTimeout(() => {
        store.completeMission('success');
      }, 2000);
    }
  }
}
