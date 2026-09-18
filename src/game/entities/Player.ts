import Phaser from 'phaser';

export class PlayerController {
  private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private ring: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private promptText: Phaser.GameObjects.Text;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private speed: number = 250;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(15); // Render above floor/particles
    
    // Subtle ground ring
    this.ring = scene.add.graphics();
    this.ring.lineStyle(2, 0x22d3ee, 0.5);
    this.ring.strokeCircle(0, 0, 24);
    this.ring.setDepth(14);
    
    // Name text
    this.nameText = scene.add.text(0, 0, 'OPERATIVE', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#22d3ee'
    }).setOrigin(0.5).setDepth(16);

    // Interaction Prompt
    this.promptText = scene.add.text(0, 0, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#0f172a',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(20).setVisible(false);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = scene.input.keyboard.addKeys('W,A,S,D') as any;
    } else {
      throw new Error("Keyboard input not available");
    }
  }

  getSprite() {
    return this.sprite;
  }

  showPrompt(text: string) {
    this.promptText.setText(text);
    this.promptText.setVisible(true);
  }

  hidePrompt() {
    this.promptText.setVisible(false);
  }

  update() {
    this.sprite.setVelocity(0);

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) velocityX = -this.speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) velocityX = this.speed;

    if (this.cursors.up.isDown || this.wasd.W.isDown) velocityY = -this.speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) velocityY = this.speed;

    // Normalize diagonal speed
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= Math.SQRT1_2;
      velocityY *= Math.SQRT1_2;
    }

    this.sprite.setVelocity(velocityX, velocityY);

    // Simple rotation towards movement
    if (velocityX !== 0 || velocityY !== 0) {
      this.sprite.setRotation(Math.atan2(velocityY, velocityX));
    }

    // Keep ring and text attached to player
    this.ring.setPosition(this.sprite.x, this.sprite.y);
    this.nameText.setPosition(this.sprite.x, this.sprite.y - 25);
    this.promptText.setPosition(this.sprite.x, this.sprite.y - 45);
  }
}
