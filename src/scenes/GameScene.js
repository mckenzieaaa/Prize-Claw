export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // world bounds
    const worldW = 900;
    const worldH = 1400;
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.physics.world.setBounds(0, 0, worldW, worldH);

    // background
    this.add.rectangle(worldW/2, worldH/2, worldW, worldH, 0x9fd07a);

    // player
    this.player = this.physics.add.image(450, 1200, 'player').setScale(2).setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24,24);

    // camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // create crops group
    this.crops = this.add.group();
    for (let i = 0; i < 12; i++) {
      const x = 100 + (i%3)*220 + Phaser.Math.Between(-20,20);
      const y = 300 + Math.floor(i/3)*200 + Phaser.Math.Between(-20,20);
      const crop = this.add.image(x,y,'crop').setInteractive();
      crop.harvested = false;
      crop.on('pointerdown', () => this.harvest(crop));
      this.crops.add(crop);
    }

    // HUD
    this.inventory = 0;
    this.hudText = this.add.text(16,16,'Crops: 0',{ fontSize: '22px', color: '#004400' }).setScrollFactor(0).setDepth(20);

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
  }

  harvest(crop) {
    if (crop.harvested) return;
    crop.harvested = true;
    this.tweens.add({ targets: crop, alpha: 0, scale: 0.1, duration: 300, onComplete: () => crop.destroy() });
    this.inventory += 1;
    this.hudText.setText('Crops: ' + this.inventory);
  }

  update(time, dt) {
    const speed = 180;
    let vx = 0; let vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) vx = -speed;
    if (this.cursors.right.isDown || this.keys.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.keys.W.isDown) vy = -speed;
    if (this.cursors.down.isDown || this.keys.S.isDown) vy = speed;
    this.player.setVelocity(vx, vy);
    if (vx === 0 && vy === 0) this.player.setVelocity(0);
  }
}
