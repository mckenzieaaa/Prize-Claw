// Claw Machine Game - Phaser 3 Web Version

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Create simple graphics for prizes using Phaser's built-in graphics
        this.createPrizeTextures();
        this.createClawTexture();
    }

    createPrizeTextures() {
        const types = [
            { key: 'bunny', color: 0xFFFFFF, accent: 0x64B4FF },
            { key: 'teddy', color: 0xD2A06E, accent: 0xF03C3C },
            { key: 'striped', color: 0xFAF5F0, accent: 0x282828 },
            { key: 'cat', color: 0xFFFFFF, accent: 0xFFC8DC }
        ];

        types.forEach(type => {
            const graphics = this.add.graphics();
            
            // Main body circle
            graphics.fillStyle(type.color, 1);
            graphics.fillCircle(28, 28, 24);
            
            // Accent details
            graphics.fillStyle(type.accent, 1);
            
            if (type.key === 'bunny') {
                // Ears
                graphics.fillEllipse(18, 10, 8, 20);
                graphics.fillEllipse(38, 10, 8, 20);
                // Overalls
                graphics.fillRect(16, 28, 24, 18);
            } else if (type.key === 'teddy') {
                // Ears
                graphics.fillCircle(16, 14, 6);
                graphics.fillCircle(40, 14, 6);
                // Overalls
                graphics.fillRect(14, 28, 28, 20);
            } else if (type.key === 'striped') {
                // Stripes
                for (let i = 0; i < 5; i++) {
                    graphics.fillRect(10, 24 + i * 6, 36, 3);
                }
            } else if (type.key === 'cat') {
                // Ears (triangles)
                graphics.fillTriangle(14, 18, 18, 8, 22, 18);
                graphics.fillTriangle(34, 18, 38, 8, 42, 18);
            }
            
            // Eyes
            graphics.fillStyle(0x000000, 1);
            graphics.fillCircle(20, 26, 2.5);
            graphics.fillCircle(36, 26, 2.5);
            
            graphics.generateTexture(type.key, 56, 56);
            graphics.destroy();
        });
    }

    createClawTexture() {
        const graphics = this.add.graphics();
        
        // Claw shape (golden/yellow)
        graphics.fillStyle(0xDCB432, 1);
        graphics.fillTriangle(28, 10, 8, 38, 48, 38);
        
        graphics.lineStyle(3, 0x64500A, 1);
        graphics.lineBetween(8, 38, 28, 10);
        graphics.lineBetween(48, 38, 28, 10);
        
        graphics.generateTexture('claw', 56, 48);
        graphics.destroy();
    }

    create() {
        const WIDTH = 540;
        const HEIGHT = 800;

        // Background
        this.add.rectangle(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT, 0xFFDCC8);
        
        // Machine frame
        this.add.rectangle(WIDTH/2, 40, WIDTH, 80, 0x643C28).setOrigin(0.5, 0);
        this.add.rectangle(25, 0, 50, HEIGHT, 0x503220).setOrigin(0, 0);
        this.add.rectangle(WIDTH-25, 0, 50, HEIGHT, 0x503220).setOrigin(1, 0);
        this.add.rectangle(WIDTH/2, HEIGHT-50, WIDTH, 100, 0x785032).setOrigin(0.5, 1);
        
        // Play area
        this.add.rectangle(WIDTH/2, HEIGHT/2, WIDTH-100, HEIGHT-190, 0xB4E6FF).setOrigin(0.5, 0.5).setDepth(0);
        
        // Prize floor
        this.add.rectangle(WIDTH/2, 600, WIDTH-100, 220, 0x967850).setOrigin(0.5, 0).setDepth(0);
        
        // Exit chute (top right)
        const exitBox = this.add.rectangle(WIDTH-80, 140, 70, 60, 0x32C832).setDepth(0);
        this.add.text(WIDTH-80, 140, 'EXIT', {
            fontSize: '18px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1);

        // Create prizes
        this.prizes = [];
        const prizeTypes = ['bunny', 'teddy', 'striped', 'cat'];
        const positions = [
            [120, 520], [220, 520], [320, 520], [420, 520],
            [120, 600], [220, 600], [320, 600], [420, 600],
            [170, 560], [270, 560], [370, 560],
            [120, 680], [270, 680], [420, 680]
        ];

        positions.forEach(pos => {
            const type = Phaser.Utils.Array.GetRandom(prizeTypes);
            const prize = this.add.image(pos[0], pos[1], type);
            prize.setData('collected', false);
            prize.setData('grabbed', false);
            prize.setDepth(2);
            this.prizes.push(prize);
        });

        // Claw
        this.claw = {
            x: WIDTH / 2,
            y: 80,
            homeX: WIDTH / 2,
            homeY: 80,
            state: 'idle',
            speedH: 180,
            speedV: 220,
            grabbedPrize: null,
            sprite: null,
            rope: null
        };

        this.claw.rope = this.add.line(0, 0, this.claw.x, 40, this.claw.x, this.claw.y, 0x505050);
        this.claw.rope.setLineWidth(3);
        this.claw.rope.setDepth(5);
        
        this.claw.sprite = this.add.image(this.claw.x, this.claw.y, 'claw');
        this.claw.sprite.setDepth(10);

        // Game state
        this.score = 0;
        this.message = '';
        this.messageTimer = 0;

        // HUD
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '28px',
            color: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setDepth(20);

        this.instructionText = this.add.text(16, 50, 'Click/Tap to move, Press SPACE or click button to grab', {
            fontSize: '16px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 2
        }).setDepth(20);

        this.messageText = this.add.text(WIDTH/2, HEIGHT/2, '', {
            fontSize: '32px',
            color: '#ff3232',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(30);

        // Grab button (mobile friendly)
        this.grabButton = this.add.rectangle(WIDTH/2, HEIGHT-130, 120, 50, 0xFF6432);
        this.grabButton.setInteractive();
        this.grabButton.setDepth(20);
        this.add.text(WIDTH/2, HEIGHT-130, 'GRAB!', {
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(21);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.input.on('pointerdown', (pointer) => {
            if (this.claw.state === 'idle') {
                // Click to move claw
                if (pointer.y < HEIGHT - 200) {
                    this.claw.targetX = Phaser.Math.Clamp(pointer.x, 80, WIDTH - 80);
                }
            }
        });

        this.grabButton.on('pointerdown', () => {
            this.startGrab();
        });
    }

    startGrab() {
        if (this.claw.state === 'idle') {
            this.claw.state = 'dropping';
            this.message = '';
            this.messageTimer = 0;
        }
    }

    update(time, delta) {
        const dt = delta / 1000;

        // Claw movement
        if (this.claw.state === 'idle') {
            // Keyboard control
            if (this.cursors.left.isDown) {
                this.claw.x -= this.claw.speedH * dt;
            }
            if (this.cursors.right.isDown) {
                this.claw.x += this.claw.speedH * dt;
            }
            
            // Mouse/touch target
            if (this.claw.targetX !== undefined) {
                const dx = this.claw.targetX - this.claw.x;
                if (Math.abs(dx) > 2) {
                    this.claw.x += Math.sign(dx) * this.claw.speedH * dt;
                } else {
                    this.claw.x = this.claw.targetX;
                    this.claw.targetX = undefined;
                }
            }

            this.claw.x = Phaser.Math.Clamp(this.claw.x, 80, 540 - 80);

            // Space or button to grab
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.startGrab();
            }
        }

        // State machine
        if (this.claw.state === 'dropping') {
            this.claw.y += this.claw.speedV * dt;
            if (this.claw.y >= 680) {
                this.claw.y = 680;
                this.claw.state = 'grabbing';
                this.tryGrab();
            }
        } else if (this.claw.state === 'grabbing') {
            this.claw.state = 'lifting';
        } else if (this.claw.state === 'lifting') {
            this.claw.y -= this.claw.speedV * dt;
            if (this.claw.grabbedPrize) {
                this.claw.grabbedPrize.setPosition(this.claw.x, this.claw.y + 40);
                
                // Chance to drop
                if (this.claw.y < 400 && Math.random() < 0.001) {
                    this.claw.grabbedPrize.setData('grabbed', false);
                    this.claw.grabbedPrize = null;
                    this.showMessage('Dropped it!', 1.5);
                }
            }
            if (this.claw.y <= 100) {
                this.claw.y = 100;
                this.claw.state = 'returning';
            }
        } else if (this.claw.state === 'returning') {
            const targetX = 540 - 80;
            const dx = targetX - this.claw.x;
            if (Math.abs(dx) > 2) {
                this.claw.x += Math.sign(dx) * this.claw.speedH * dt;
                if (this.claw.grabbedPrize) {
                    this.claw.grabbedPrize.setPosition(this.claw.x, this.claw.y + 40);
                }
            } else {
                this.claw.x = targetX;
                this.claw.state = 'delivering';
            }
        } else if (this.claw.state === 'delivering') {
            if (this.claw.grabbedPrize) {
                this.claw.grabbedPrize.setData('collected', true);
                this.claw.grabbedPrize.destroy();
                this.score++;
                this.scoreText.setText('Score: ' + this.score);
                this.showMessage('Success! Score: ' + this.score, 2);
                this.claw.grabbedPrize = null;
            }
            this.claw.state = 'resetting';
        } else if (this.claw.state === 'resetting') {
            const dx = this.claw.homeX - this.claw.x;
            const dy = this.claw.homeY - this.claw.y;
            
            if (Math.abs(dx) > 2) {
                this.claw.x += Math.sign(dx) * this.claw.speedH * dt;
            } else {
                this.claw.x = this.claw.homeX;
            }
            
            if (Math.abs(dy) > 2) {
                this.claw.y += Math.sign(dy) * this.claw.speedV * dt;
            } else {
                this.claw.y = this.claw.homeY;
                this.claw.state = 'idle';
            }
        }

        // Update claw visuals
        this.claw.sprite.setPosition(this.claw.x, this.claw.y);
        this.claw.rope.setTo(this.claw.x, 40, this.claw.x, this.claw.y);

        // Message timer
        if (this.messageTimer > 0) {
            this.messageTimer -= dt;
            if (this.messageTimer <= 0) {
                this.messageText.setText('');
            }
        }
    }

    tryGrab() {
        const grabRect = new Phaser.Geom.Rectangle(this.claw.x - 35, this.claw.y + 10, 70, 45);
        let grabbed = false;

        for (let prize of this.prizes) {
            if (prize.getData('collected') || prize.getData('grabbed')) continue;
            
            const prizeRect = prize.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(grabRect, prizeRect)) {
                // 70% success rate
                if (Math.random() < 0.7) {
                    this.claw.grabbedPrize = prize;
                    prize.setData('grabbed', true);
                    grabbed = true;
                    this.showMessage('Caught one!', 2);
                    break;
                }
            }
        }

        if (!grabbed) {
            this.showMessage('Missed...', 1.5);
        }
    }

    showMessage(text, duration) {
        this.message = text;
        this.messageTimer = duration;
        this.messageText.setText(text);
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 540,
    height: 800,
    backgroundColor: '#88c070',
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
