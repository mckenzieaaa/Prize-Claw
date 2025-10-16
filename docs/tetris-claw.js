// Tetris Claw - Modern Block Grabber Game
// A unique twist on claw machines with Tetris pieces and stacking mechanics

const TETROMINO_SHAPES = {
    I: { blocks: [[0,0], [1,0], [2,0], [3,0]], color: 0x00F0F0, name: 'I' },
    O: { blocks: [[0,0], [1,0], [0,1], [1,1]], color: 0xF0F000, name: 'O' },
    T: { blocks: [[1,0], [0,1], [1,1], [2,1]], color: 0xA000F0, name: 'T' },
    S: { blocks: [[1,0], [2,0], [0,1], [1,1]], color: 0x00F000, name: 'S' },
    Z: { blocks: [[0,0], [1,0], [1,1], [2,1]], color: 0xF00000, name: 'Z' },
    J: { blocks: [[0,0], [0,1], [1,1], [2,1]], color: 0x0000F0, name: 'J' },
    L: { blocks: [[2,0], [0,1], [1,1], [2,1]], color: 0xF0A000, name: 'L' }
};

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.BLOCK_SIZE = 40;
        this.GRID_WIDTH = 10;
        this.GRID_HEIGHT = 16;
        this.DANGER_LINE = 3; // Red line at row 3 from top
    }

    preload() {
        this.createBlockTextures();
    }

    createBlockTextures() {
        // Create modern frosted glass blocks for each Tetromino type
        Object.entries(TETROMINO_SHAPES).forEach(([key, data]) => {
            const graphics = this.add.graphics();
            const size = this.BLOCK_SIZE;
            
            // Main block with gradient
            graphics.fillGradientStyle(
                Phaser.Display.Color.ValueToColor(data.color).lighten(20).color,
                Phaser.Display.Color.ValueToColor(data.color).lighten(20).color,
                Phaser.Display.Color.ValueToColor(data.color).darken(10).color,
                Phaser.Display.Color.ValueToColor(data.color).darken(10).color,
                0.9
            );
            graphics.fillRoundedRect(2, 2, size-4, size-4, 8);
            
            // Frosted glass overlay
            graphics.fillStyle(0xFFFFFF, 0.2);
            graphics.fillRoundedRect(2, 2, size-4, size/2, 8);
            
            // Glossy highlight
            graphics.fillStyle(0xFFFFFF, 0.4);
            graphics.fillRoundedRect(8, 8, size-20, 8, 4);
            
            // Border glow
            graphics.lineStyle(2, Phaser.Display.Color.ValueToColor(data.color).lighten(30).color, 0.6);
            graphics.strokeRoundedRect(2, 2, size-4, size-4, 8);
            
            graphics.generateTexture(`block_${key}`, size, size);
            graphics.destroy();
        });

        // Create claw texture
        this.createClawTexture();
    }

    createClawTexture() {
        const graphics = this.add.graphics();
        const size = 60;
        
        // Modern minimalist claw
        // Upper part (metallic gradient)
        graphics.fillGradientStyle(0xE0E0E0, 0xE0E0E0, 0x909090, 0x909090, 1);
        graphics.fillRoundedRect(size/2 - 4, 0, 8, 20, 4);
        
        // Claw arms
        graphics.lineStyle(6, 0xB0B0B0, 1);
        graphics.beginPath();
        graphics.moveTo(size/2, 20);
        graphics.lineTo(size/2 - 20, 45);
        graphics.strokePath();
        
        graphics.beginPath();
        graphics.moveTo(size/2, 20);
        graphics.lineTo(size/2 + 20, 45);
        graphics.strokePath();
        
        // Glow effect
        graphics.lineStyle(2, 0xFFFFFF, 0.6);
        graphics.strokeRoundedRect(size/2 - 3, 1, 6, 18, 3);
        
        graphics.generateTexture('claw', size, size);
        graphics.destroy();
    }

    create() {
        const WIDTH = this.BLOCK_SIZE * this.GRID_WIDTH;
        const HEIGHT = this.BLOCK_SIZE * this.GRID_HEIGHT;
        const OFFSET_X = 60;
        const OFFSET_Y = 80;

        // Dark modern background
        this.add.rectangle(
            OFFSET_X + WIDTH/2, 
            OFFSET_Y + HEIGHT/2, 
            WIDTH + OFFSET_X * 2, 
            HEIGHT + OFFSET_Y * 2, 
            0x1a1a2e
        );

        // Game area background with frosted effect
        const gameArea = this.add.rectangle(
            OFFSET_X + WIDTH/2,
            OFFSET_Y + HEIGHT/2,
            WIDTH,
            HEIGHT,
            0x0a0a1a,
            0.6
        );

        // Grid lines (subtle)
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, 0x2a2a3e, 0.3);
        for (let x = 0; x <= this.GRID_WIDTH; x++) {
            gridGraphics.lineBetween(
                OFFSET_X + x * this.BLOCK_SIZE,
                OFFSET_Y,
                OFFSET_X + x * this.BLOCK_SIZE,
                OFFSET_Y + HEIGHT
            );
        }
        for (let y = 0; y <= this.GRID_HEIGHT; y++) {
            gridGraphics.lineBetween(
                OFFSET_X,
                OFFSET_Y + y * this.BLOCK_SIZE,
                OFFSET_X + WIDTH,
                OFFSET_Y + y * this.BLOCK_SIZE
            );
        }

        // Red danger line with glow
        const dangerY = OFFSET_Y + this.DANGER_LINE * this.BLOCK_SIZE;
        this.dangerLine = this.add.rectangle(
            OFFSET_X + WIDTH/2,
            dangerY,
            WIDTH,
            3,
            0xFF3366
        );
        this.add.rectangle(
            OFFSET_X + WIDTH/2,
            dangerY,
            WIDTH,
            20,
            0xFF3366,
            0.2
        );

        // Pulse animation for danger line
        this.tweens.add({
            targets: this.dangerLine,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Game state
        this.gridData = Array(this.GRID_HEIGHT).fill().map(() => Array(this.GRID_WIDTH).fill(null));
        this.blocks = [];
        this.claw = {
            x: OFFSET_X + WIDTH/2,
            y: OFFSET_Y - 20,
            homeX: OFFSET_X + WIDTH/2,
            homeY: OFFSET_Y - 20,
            state: 'idle',
            speedH: 200,
            speedV: 250,
            grabbedBlocks: [],
            sprite: null,
            rope: null
        };

        this.offsetX = OFFSET_X;
        this.offsetY = OFFSET_Y;
        this.score = 0;
        this.level = 1;
        this.spawnTimer = 0;
        this.spawnInterval = 4000; // 4 seconds
        this.gameOver = false;

        // Claw rope
        this.claw.rope = this.add.line(
            0, 0,
            this.claw.x, OFFSET_Y - 40,
            this.claw.x, this.claw.y,
            0x808080
        );
        this.claw.rope.setLineWidth(2);
        this.claw.rope.setDepth(100);
        this.claw.rope.setAlpha(0.8);

        // Claw sprite
        this.claw.sprite = this.add.image(this.claw.x, this.claw.y, 'claw');
        this.claw.sprite.setDepth(101);

        // Modern UI
        this.createModernUI(WIDTH, HEIGHT, OFFSET_X, OFFSET_Y);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.input.on('pointerdown', (pointer) => {
            if (this.gameOver) {
                this.scene.restart();
                return;
            }
            if (this.claw.state === 'idle') {
                const minX = OFFSET_X + this.BLOCK_SIZE/2;
                const maxX = OFFSET_X + WIDTH - this.BLOCK_SIZE/2;
                this.claw.targetX = Phaser.Math.Clamp(pointer.x, minX, maxX);
            }
        });

        // Spawn initial row
        this.spawnNewRow();
    }

    createModernUI(WIDTH, HEIGHT, OFFSET_X, OFFSET_Y) {
        // Score panel (top left) - frosted glass effect
        const scorePanel = this.add.rectangle(30, 30, 180, 80, 0x1a1a2e, 0.8);
        scorePanel.setStrokeStyle(2, 0x5e72e4, 0.6);
        scorePanel.setOrigin(0, 0);
        scorePanel.setDepth(200);

        this.scoreText = this.add.text(40, 45, 'SCORE', {
            fontSize: '14px',
            color: '#8899AA',
            fontStyle: 'bold',
            letterSpacing: 2
        }).setDepth(201);

        this.scoreValue = this.add.text(40, 65, '0', {
            fontSize: '28px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setDepth(201);

        // Level indicator
        this.levelText = this.add.text(140, 65, 'L1', {
            fontSize: '20px',
            color: '#5e72e4',
            fontStyle: 'bold'
        }).setDepth(201);

        // Instructions panel
        const instructionPanel = this.add.rectangle(
            OFFSET_X + WIDTH/2,
            OFFSET_Y + HEIGHT + 50,
            WIDTH,
            60,
            0x1a1a2e,
            0.8
        );
        instructionPanel.setStrokeStyle(2, 0x5e72e4, 0.4);
        instructionPanel.setDepth(200);

        this.instructionText = this.add.text(
            OFFSET_X + WIDTH/2,
            OFFSET_Y + HEIGHT + 50,
            'ARROWS to move • SPACE to grab • Clear blocks before they reach the RED LINE!',
            {
                fontSize: '14px',
                color: '#AABBCC',
                fontStyle: 'normal'
            }
        ).setOrigin(0.5).setDepth(201);

        // Game over overlay (hidden initially)
        this.gameOverGroup = this.add.group();
        const overlay = this.add.rectangle(
            OFFSET_X + WIDTH/2,
            OFFSET_Y + HEIGHT/2,
            WIDTH * 2,
            HEIGHT * 2,
            0x000000,
            0.85
        ).setDepth(300);
        overlay.setVisible(false);

        const gameOverText = this.add.text(
            OFFSET_X + WIDTH/2,
            OFFSET_Y + HEIGHT/2 - 40,
            'GAME OVER',
            {
                fontSize: '48px',
                color: '#FF3366',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setDepth(301);
        gameOverText.setVisible(false);

        const restartText = this.add.text(
            OFFSET_X + WIDTH/2,
            OFFSET_Y + HEIGHT/2 + 40,
            'Click to restart',
            {
                fontSize: '20px',
                color: '#AABBCC'
            }
        ).setOrigin(0.5).setDepth(301);
        restartText.setVisible(false);

        this.gameOverGroup.addMultiple([overlay, gameOverText, restartText]);
        this.gameOverOverlay = overlay;
        this.gameOverText = gameOverText;
        this.restartText = restartText;
    }

    spawnNewRow() {
        if (this.gameOver) return;

        const shapes = Object.keys(TETROMINO_SHAPES);
        const numPieces = Phaser.Math.Between(2, 4);
        
        for (let i = 0; i < numPieces; i++) {
            const shapeKey = Phaser.Utils.Array.GetRandom(shapes);
            const shape = TETROMINO_SHAPES[shapeKey];
            const startCol = Phaser.Math.Between(0, this.GRID_WIDTH - 4);
            
            shape.blocks.forEach(([bx, by]) => {
                const gridX = startCol + bx;
                const gridY = this.GRID_HEIGHT - 1 - by;
                
                if (gridX >= 0 && gridX < this.GRID_WIDTH && !this.gridData[gridY][gridX]) {
                    const block = this.add.image(
                        this.offsetX + gridX * this.BLOCK_SIZE + this.BLOCK_SIZE/2,
                        this.offsetY + gridY * this.BLOCK_SIZE + this.BLOCK_SIZE/2,
                        `block_${shapeKey}`
                    );
                    block.setData('gridX', gridX);
                    block.setData('gridY', gridY);
                    block.setData('type', shapeKey);
                    block.setDepth(10);
                    
                    this.blocks.push(block);
                    this.gridData[gridY][gridX] = block;
                }
            });
        }

        // Move all blocks up by one row
        this.moveBlocksUp();
    }

    moveBlocksUp() {
        // Move blocks up in grid
        for (let y = 0; y < this.GRID_HEIGHT - 1; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                this.gridData[y][x] = this.gridData[y + 1][x];
                if (this.gridData[y][x]) {
                    this.gridData[y][x].setData('gridY', y);
                }
            }
        }
        // Clear bottom row
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            this.gridData[this.GRID_HEIGHT - 1][x] = null;
        }

        // Animate blocks moving up
        this.blocks.forEach(block => {
            const gridY = block.getData('gridY');
            const gridX = block.getData('gridX');
            this.tweens.add({
                targets: block,
                y: this.offsetY + gridY * this.BLOCK_SIZE + this.BLOCK_SIZE/2,
                duration: 300,
                ease: 'Cubic.easeOut'
            });
        });

        // Check game over
        this.checkGameOver();
    }

    checkGameOver() {
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            if (this.gridData[this.DANGER_LINE][x]) {
                this.triggerGameOver();
                return;
            }
        }
    }

    triggerGameOver() {
        this.gameOver = true;
        this.gameOverOverlay.setVisible(true);
        this.gameOverText.setVisible(true);
        this.restartText.setVisible(true);

        // Pulse animation
        this.tweens.add({
            targets: this.gameOverText,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    update(time, delta) {
        if (this.gameOver) return;

        const dt = delta / 1000;

        // Spawn timer
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnNewRow();
        }

        // Claw movement
        if (this.claw.state === 'idle') {
            const minX = this.offsetX + this.BLOCK_SIZE/2;
            const maxX = this.offsetX + this.BLOCK_SIZE * this.GRID_WIDTH - this.BLOCK_SIZE/2;

            if (this.cursors.left.isDown) {
                this.claw.x -= this.claw.speedH * dt;
            }
            if (this.cursors.right.isDown) {
                this.claw.x += this.claw.speedH * dt;
            }

            if (this.claw.targetX !== undefined) {
                const dx = this.claw.targetX - this.claw.x;
                if (Math.abs(dx) > 2) {
                    this.claw.x += Math.sign(dx) * this.claw.speedH * dt;
                } else {
                    this.claw.x = this.claw.targetX;
                    this.claw.targetX = undefined;
                }
            }

            this.claw.x = Phaser.Math.Clamp(this.claw.x, minX, maxX);

            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.startGrab();
            }
        } else if (this.claw.state === 'dropping') {
            this.claw.y += this.claw.speedV * dt;
            const maxY = this.offsetY + this.BLOCK_SIZE * this.GRID_HEIGHT - this.BLOCK_SIZE/2;
            if (this.claw.y >= maxY) {
                this.claw.y = maxY;
                this.tryGrab();
                this.claw.state = 'lifting';
            }
        } else if (this.claw.state === 'lifting') {
            this.claw.y -= this.claw.speedV * dt;
            this.claw.grabbedBlocks.forEach(block => {
                const offsetFromClaw = block.getData('offsetFromClaw');
                block.y = this.claw.y + offsetFromClaw.y;
            });

            if (this.claw.y <= this.claw.homeY) {
                this.claw.y = this.claw.homeY;
                this.deliverBlocks();
                this.claw.state = 'idle';
            }
        }

        // Update claw visuals
        this.claw.sprite.setPosition(this.claw.x, this.claw.y);
        this.claw.rope.setTo(
            this.claw.x,
            this.offsetY - 40,
            this.claw.x,
            this.claw.y
        );
    }

    startGrab() {
        this.claw.state = 'dropping';
    }

    tryGrab() {
        const grabRadius = this.BLOCK_SIZE * 1.2;
        const grabbed = [];

        this.blocks.forEach(block => {
            const dx = block.x - this.claw.x;
            const dy = block.y - this.claw.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < grabRadius && Math.random() < 0.8) {
                grabbed.push(block);
                block.setData('offsetFromClaw', { x: dx, y: dy });
                
                // Remove from grid
                const gridX = block.getData('gridX');
                const gridY = block.getData('gridY');
                this.gridData[gridY][gridX] = null;
            }
        });

        this.claw.grabbedBlocks = grabbed;
    }

    deliverBlocks() {
        this.claw.grabbedBlocks.forEach(block => {
            this.tweens.add({
                targets: block,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => {
                    block.destroy();
                    this.blocks = this.blocks.filter(b => b !== block);
                }
            });
            
            this.score += 10;
        });

        if (this.claw.grabbedBlocks.length > 0) {
            this.scoreValue.setText(this.score.toString());
            
            // Level up every 100 points
            const newLevel = Math.floor(this.score / 100) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.levelText.setText('L' + this.level);
                this.spawnInterval = Math.max(2000, 4000 - (this.level - 1) * 300);
            }
        }

        this.claw.grabbedBlocks = [];
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 580,
    height: 800,
    backgroundColor: '#1a1a2e',
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
