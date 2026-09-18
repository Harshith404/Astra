import Phaser from 'phaser';

export class PlayerController {
  private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed: number = 250;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10); // Render above floor/particles

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
    } else {
      throw new Error("Keyboard input not available");
    }
  }

  getSprite() {
    return this.sprite;
  }

  update() {
    this.sprite.setVelocity(0);

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) velocityX = -this.speed;
    else if (this.cursors.right.isDown) velocityX = this.speed;

    if (this.cursors.up.isDown) velocityY = -this.speed;
    else if (this.cursors.down.isDown) velocityY = this.speed;

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
  }
}
