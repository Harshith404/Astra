import Phaser from 'phaser';
import { useGameStore, Robot } from '../../game/simulation/gameState';
import { updateSimulation } from '../../game/simulation/systems/gameLoop';
import { getMissionConfig } from '../../game/content/missions';
import { PlayerController } from '../../game/entities/Player';

export default class GameScene extends Phaser.Scene {
  private player!: PlayerController;
  private robotsMap: Map<string, Phaser.Types.Physics.Arcade.SpriteWithDynamicBody> = new Map();
  private robotUIMap: Map<string, Phaser.GameObjects.Container> = new Map();
  private commStation!: Phaser.GameObjects.Sprite;
  private colonistsGroup!: Phaser.Physics.Arcade.Group;
  private dataTerminalsGroup!: Phaser.Physics.Arcade.Group;
  private anomaliesGroup!: Phaser.Physics.Arcade.Group;
  private astraChamber!: Phaser.GameObjects.Sprite;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private deployPreview!: Phaser.GameObjects.Sprite;
  private deployRadius!: Phaser.GameObjects.Graphics;
  private objectiveMarker!: Phaser.GameObjects.Graphics;

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
    this.robotsMap.clear();
    this.robotUIMap.clear();
    
    config.initialRobots.forEach(robot => store.addRobot(robot));

    // 4. Visual Representations (Adapters)
    // Setup Level Geometry/Entities depending on levelId
    this.colonistsGroup = this.physics.add.group();
    this.dataTerminalsGroup = this.physics.add.group();
    this.anomaliesGroup = this.physics.add.group();

    if (data.levelId === 'level-1') {
      // Outpost Delta - Scattered around central base
      this.commStation = this.add.sprite(1200, 300, 'comm_station_offline').setDepth(5);
      this.physics.add.existing(this.commStation, true);
      this.physics.add.collider(this.player.getSprite(), this.commStation);

      const colPos = [[900, 400], [1300, 500], [1000, 800], [700, 900], [1100, 200]];
      for (let i = 0; i < Math.min(config.totalColonists, colPos.length); i++) {
        const col = this.colonistsGroup.create(colPos[i][0], colPos[i][1], 'colonist').setDepth(5);
        this.physics.add.existing(col, true);
      }
    } 
    else if (data.levelId === 'level-2') {
      // Helios Lab - Modules
      // Draw some floor panels to simulate a lab
      const graphics = this.add.graphics();
      graphics.fillStyle(0x1a202c, 0.8);
      graphics.lineStyle(2, 0x4a5568);
      graphics.fillRect(400, 200, 800, 800);
      graphics.strokeRect(400, 200, 800, 800);
      
      this.commStation = this.add.sprite(800, 250, 'comm_station_offline').setDepth(5);
      this.physics.add.existing(this.commStation, true);
      this.physics.add.collider(this.player.getSprite(), this.commStation);

      const termPos = [[500, 400], [1100, 400], [800, 800]];
      for (let i = 0; i < store.dataTotal; i++) {
        const term = this.dataTerminalsGroup.create(termPos[i][0], termPos[i][1], 'data_terminal');
        term.setDepth(5).setTint(0x4299e1);
        this.physics.add.existing(term, true);
      }

      const colPos = [[600, 300], [1000, 300], [500, 700], [1100, 700]];
      for (let i = 0; i < Math.min(config.totalColonists, colPos.length); i++) {
        const col = this.colonistsGroup.create(colPos[i][0], colPos[i][1], 'colonist').setDepth(5);
        this.physics.add.existing(col, true);
      }
    }
    else if (data.levelId === 'level-3') {
      // Buried Signal - Underground corridor
      this.cameras.main.setBackgroundColor('#000000');
      
      this.commStation = this.add.sprite(800, 500, 'comm_station_offline').setDepth(5).setVisible(false);
      this.physics.add.existing(this.commStation, true);
      this.physics.add.collider(this.player.getSprite(), this.commStation);
      
      const anomPos = [[500, 800], [1100, 800], [800, 200]];
      for (let i = 0; i < store.anomaliesTotal; i++) {
        const anomaly = this.anomaliesGroup.create(anomPos[i][0], anomPos[i][1], 'anomaly');
        anomaly.setDepth(5).setTint(0xa855f7).setAlpha(0.8);
        this.physics.add.existing(anomaly, true);
      }
      
      this.astraChamber = this.add.sprite(800, 100, 'astra_chamber').setDepth(5).setTint(0x22d3ee).setVisible(false);
      this.physics.add.existing(this.astraChamber, true);
    }

    // 5. Setup Input
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    // Deployment Previews
    this.deployPreview = this.add.sprite(0, 0, 'robot_standard').setAlpha(0.5).setDepth(20).setVisible(false).setScale(0.12);
    this.deployRadius = this.add.graphics().setDepth(19).setVisible(false);

    // Objective Marker
    this.objectiveMarker = this.add.graphics().setDepth(20).setVisible(false);

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
      let nearestObj: any = null;
      let minObjDist = 9999;

      this.colonistsGroup.getChildren().forEach((c: any) => {
        if (!c.active) return;
        const d = Phaser.Math.Distance.Between(p.x, p.y, c.x, c.y);
        if (d < minObjDist) { minObjDist = d; nearestObj = c; }
        if (!foundInteractable && d < 50) {
          canInteract = true; promptText = '[SPACE] RESCUE COLONIST'; foundInteractable = true;
        }
      });

      this.dataTerminalsGroup.getChildren().forEach((t: any) => {
        if (!t.active) return;
        const d = Phaser.Math.Distance.Between(p.x, p.y, t.x, t.y);
        if (d < minObjDist) { minObjDist = d; nearestObj = t; }
        if (!foundInteractable && d < 60) {
          canInteract = true; promptText = '[SPACE] DOWNLOAD DATA'; foundInteractable = true;
        }
      });

      this.anomaliesGroup.getChildren().forEach((a: any) => {
        if (!a.active) return;
        const d = Phaser.Math.Distance.Between(p.x, p.y, a.x, a.y);
        if (d < minObjDist) { minObjDist = d; nearestObj = a; }
        if (!foundInteractable && d < 60) {
          canInteract = true; promptText = '[SPACE] INVESTIGATE ANOMALY'; foundInteractable = true;
        }
      });

      // Point arrow to nearest objective if too far
      this.objectiveMarker.clear();
      if (!canInteract && nearestObj && minObjDist > 300) {
        const angle = Phaser.Math.Angle.Between(p.x, p.y, nearestObj.x, nearestObj.y);
        const arrowDist = 80;
        const arrowX = p.x + Math.cos(angle) * arrowDist;
        const arrowY = p.y + Math.sin(angle) * arrowDist;
        
        this.objectiveMarker.lineStyle(2, 0x22d3ee, 0.8);
        this.objectiveMarker.fillStyle(0x22d3ee, 0.8);
        
        // Draw simple line pointing to target
        this.objectiveMarker.beginPath();
        this.objectiveMarker.moveTo(p.x, p.y);
        this.objectiveMarker.lineTo(arrowX, arrowY);
        
        // Draw circle at end of pointer
        this.objectiveMarker.fillCircle(arrowX, arrowY, 6);
        this.objectiveMarker.strokePath();
        
        this.objectiveMarker.setVisible(true);
      } else {
        this.objectiveMarker.setVisible(false);
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
      let ui = this.robotUIMap.get(robot.id);
      
      if (robot.state === 'destroyed') {
        if (sprite) {
          // Explosion effect
          const emitter = this.add.particles(sprite.x, sprite.y, 'storm_particle', {
            speed: { min: 50, max: 200 },
            scale: { start: 0.5, end: 0 },
            lifespan: 600,
            blendMode: 'ADD'
          });
          emitter.explode(30);
          sprite.destroy();
          if (ui) ui.destroy();
          this.robotsMap.delete(robot.id);
          this.robotUIMap.delete(robot.id);
        }
        return;
      }

      if (!sprite) {
        let tex = 'robot_standard';
        if (robot.subType === 'repair') tex = 'robot_repair';
        if (robot.subType === 'heavy') tex = 'robot_heavy';
        if (robot.subType === 'shield') tex = 'robot_shield';

        sprite = this.physics.add.sprite(robot.x, robot.y, tex).setDepth(8);
        sprite.setScale(0.12);
        this.robotsMap.set(robot.id, sprite);

        ui = this.add.container(robot.x, robot.y).setDepth(9);
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.4);
        shadow.fillEllipse(0, 20, 40, 15);
        
        const healthBg = this.add.graphics();
        healthBg.fillStyle(0x000000, 0.8);
        healthBg.fillRect(-20, -30, 40, 4);
        
        const healthBar = this.add.graphics();
        healthBar.setName('health');
        
        ui.add([shadow, healthBg, healthBar]);
        this.robotUIMap.set(robot.id, ui);
      }
      
      // Update UI
      if (ui) {
        ui.setPosition(sprite.x, sprite.y);
        const healthBar = ui.getByName('health') as Phaser.GameObjects.Graphics;
        healthBar.clear();
        healthBar.fillStyle(robot.state === 'rogue' ? 0xef4444 : 0x10b981, 1);
        healthBar.fillRect(-20, -30, 40 * (robot.health / robot.maxHealth), 4);
      }
      
      // Animation & bobbing
      const speed = sprite.body.velocity.length();
      if (speed > 5) {
        sprite.scaleY = 0.12 * (1 + Math.sin(this.time.now / 50) * 0.1);
      } else {
        sprite.scaleY = 0.12;
      }

      if (robot.state === 'rogue') {
        sprite.setTint(0xff5555); // Reddish/purple tint
        if (Math.random() < 0.1) {
          sprite.setAlpha(Phaser.Math.FloatBetween(0.5, 1)); // flicker
          // Glitch particle
          if (Math.random() < 0.2) this.add.circle(sprite.x + Phaser.Math.Between(-20, 20), sprite.y + Phaser.Math.Between(-20, 20), 2, 0xff00ff).setDepth(20).setAlpha(0.8);
        }
        
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

    // Handle Projectile Overlaps & Combat FX
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
              
              // Hit flash
              targetSprite.setTint(0xffffff);
              this.time.delayedCall(50, () => targetSprite.clearTint());
            }
          }
        });
      }
    });

    // Storm particle effects (visual only, dense in certain areas)
    if (Math.random() < 0.5) {
      const px = this.cameras.main.scrollX + Phaser.Math.Between(0, 1000);
      const py = this.cameras.main.scrollY + Phaser.Math.Between(0, 800);
      const isDangerous = Math.random() < 0.2; // Purple arcs
      const color = isDangerous ? 0xa855f7 : 0xffffff;
      
      const particle = this.add.circle(px, py, isDangerous ? 3 : 1, color).setAlpha(Phaser.Math.FloatBetween(0.3, 0.8)).setDepth(20);
      
      this.tweens.add({
        targets: particle,
        x: px - 150,
        y: py + 100,
        alpha: 0,
        duration: isDangerous ? 1000 : 2500,
        ease: 'Cubic.easeOut',
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
        
        // Dramatic sequence
        this.cameras.main.flash(2000, 168, 85, 247); // Purple flash
        const t1 = this.add.text(800, 400, 'SIGNAL LOCKED', { color: '#a855f7', fontSize: '32px', fontStyle: 'black' }).setOrigin(0.5).setScrollFactor(0);
        
        this.time.delayedCall(1500, () => {
          t1.setText('ASTRA\nLOCATION CONFIRMED');
          this.cameras.main.shake(500, 0.01);
        });
        
        this.time.delayedCall(3500, () => {
          t1.setText("SHE'S ALIVE.");
          t1.setFontSize(48);
          t1.setColor('#ffffff');
          this.cameras.main.flash(1000, 255, 255, 255);
        });
        
        this.time.delayedCall(6000, () => {
          t1.destroy();
          this.checkMissionComplete();
        });
        
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
      // prevent multiple triggers without fully completing zustand store yet
      (store as any).missionStatus = 'success'; // Bypass for local pause
      
      // Dramatic flash
      this.cameras.main.flash(500, 255, 255, 255);
      
      const text = this.add.text(800, 300, '✓ OBJECTIVES COMPLETE', { color: '#34d399', fontSize: '48px', fontStyle: 'black' }).setOrigin(0.5).setDepth(100);
      text.setScrollFactor(0);
      
      const sub = this.add.text(800, 360, 'COMMUNICATIONS RESTORED', { color: '#22d3ee', fontSize: '24px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(100);
      sub.setScrollFactor(0);
      
      this.time.delayedCall(3000, () => {
        store.completeMission('success');
      });
    }
  }
}
