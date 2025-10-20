// Tetris Claw - Modern Block Grabber Game
// WASD to move grabbed piece, SPACE to grab/release
// Drag pieces to EXIT box to score!

const TETROMINO_SHAPES = {
    I: { blocks: [[0,0], [1,0], [2,0], [3,0]], color: 0x00F0F0, name: 'I' },
    O: { blocks: [[0,0], [1,0], [0,1], [1,1]], color: 0xF0F000, name: 'O' },
    T: { blocks: [[1,0], [0,1], [1,1], [2,1]], color: 0xA000F0, name: 'T' },
    S: { blocks: [[1,0], [2,0], [0,1], [1,1]], color: 0x00F000, name: 'S' },
    Z: { blocks: [[0,0], [1,0], [1,1], [2,1]], color: 0xF00000, name: 'Z' },
    J: { blocks: [[0,0], [0,1], [1,1], [2,1]], color: 0x0000F0, name: 'J' },
    L: { blocks: [[2,0], [0,1], [1,1], [2,1]], color: 0xF0A000, name: 'L' }
};

// Main Menu Scene
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const WIDTH = 700;
        const HEIGHT = 800;

        // Background gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f0f1a, 0x0f0f1a, 0x1a1a2e, 0x1a1a2e, 1);
        bg.fillRect(0, 0, WIDTH, HEIGHT);

        // Floating particles
        this.createAmbientParticles(WIDTH, HEIGHT);

        // Title
        const title = this.add.text(WIDTH/2, 180, 'TETRIS CLAW', {
            fontSize: '64px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#5E72E4',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: 170,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle
        this.add.text(WIDTH/2, 260, 'Modern Block Grabber', {
            fontSize: '24px',
            color: '#8899AA',
            fontStyle: 'normal'
        }).setOrigin(0.5);

        // Play button
        this.createButton(WIDTH/2, 380, 'PLAY', () => {
            this.scene.start('GameScene');
        });

        // How to play
        const instructions = [
            'Move claw and grab blocks',
            'Auto delivers to EXIT box',
            'Blocks fall with gravity',
            'Clear before RED LINE!'
        ];

        instructions.forEach((text, i) => {
            this.add.text(WIDTH/2, 500 + i * 35, text, {
                fontSize: '18px',
                color: '#AABBCC'
            }).setOrigin(0.5);
        });

        // Credits
        this.add.text(WIDTH/2, HEIGHT - 40, 'Modern Minimalist Design', {
            fontSize: '14px',
            color: '#556677'
        }).setOrigin(0.5);
    }

    createButton(x, y, text, callback) {
        const btn = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 220, 60, 0x5E72E4, 0.8);
        bg.setStrokeStyle(2, 0x8899FF, 0.8);
        
        const label = this.add.text(0, 0, text, {
            fontSize: '28px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, label]);
        btn.setSize(220, 60);
        btn.setInteractive();

        btn.on('pointerover', () => {
            this.tweens.add({
                targets: bg,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200
            });
        });

        btn.on('pointerout', () => {
            this.tweens.add({
                targets: bg,
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
        });

        btn.on('pointerdown', callback);

        return btn;
    }

    createAmbientParticles(WIDTH, HEIGHT) {
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, WIDTH);
            const y = Phaser.Math.Between(0, HEIGHT);
            const size = Phaser.Math.Between(1, 3);
            const particle = this.add.circle(x, y, size, 0x5E72E4, Phaser.Math.FloatBetween(0.1, 0.3));
            
            this.tweens.add({
                targets: particle,
                y: y - 200,
                alpha: 0,
                duration: Phaser.Math.Between(5000, 10000),
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
}

// Main Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.BLOCK_SIZE = 40;
        this.GRID_WIDTH = 8;
        this.GRID_HEIGHT = 14;
        this.DANGER_LINE = 3;
    }

    preload() {
        this.createBlockTextures();
    }

    createBlockTextures() {
        Object.entries(TETROMINO_SHAPES).forEach(([key, data]) => {
            const graphics = this.add.graphics();
            const size = this.BLOCK_SIZE;
            
            // Shadow
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRoundedRect(4, 6, size-4, size-4, 8);
            
            // Main block with gradient
            const color = Phaser.Display.Color.ValueToColor(data.color);
            graphics.fillGradientStyle(
                color.lighten(30).color,
                color.lighten(20).color,
                color.darken(5).color,
                color.darken(15).color,
                0.95
            );
            graphics.fillRoundedRect(2, 2, size-4, size-4, 8);
            
            // Glossy layer
            graphics.fillStyle(0xFFFFFF, 0.25);
            graphics.fillRoundedRect(2, 2, size-4, size/2.5, 8);
            
            // Highlight
            graphics.fillStyle(0xFFFFFF, 0.5);
            graphics.fillRoundedRect(6, 6, size-16, 6, 3);
            
            // Border glow
            graphics.lineStyle(2, color.lighten(35).color, 0.7);
            graphics.strokeRoundedRect(2, 2, size-4, size-4, 8);
            
            graphics.generateTexture(`block_${key}`, size, size);
            graphics.destroy();
        });
    }

    create() {
        const WIDTH = this.BLOCK_SIZE * this.GRID_WIDTH;
        const HEIGHT = this.BLOCK_SIZE * this.GRID_HEIGHT;
        const OFFSET_X = 200;  // Move game area to right
        const OFFSET_Y = 120;   // More space at top

        this.offsetX = OFFSET_X;
        this.offsetY = OFFSET_Y;

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f0f1a, 0x0f0f1a, 0x1a1a2e, 0x1a1a2e, 1);
        bg.fillRect(0, 0, 700, 800);

        // Game area
        this.add.rectangle(OFFSET_X + WIDTH/2, OFFSET_Y + HEIGHT/2, WIDTH, HEIGHT, 0x0a0a1a, 0.5);
        
        // Grid
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x2a2a3e, 0.15);
        for (let x = 0; x <= this.GRID_WIDTH; x++) {
            grid.lineBetween(OFFSET_X + x * this.BLOCK_SIZE, OFFSET_Y, OFFSET_X + x * this.BLOCK_SIZE, OFFSET_Y + HEIGHT);
        }
        for (let y = 0; y <= this.GRID_HEIGHT; y++) {
            grid.lineBetween(OFFSET_X, OFFSET_Y + y * this.BLOCK_SIZE, OFFSET_X + WIDTH, OFFSET_Y + y * this.BLOCK_SIZE);
        }

        // Red danger line
        const dangerY = OFFSET_Y + this.DANGER_LINE * this.BLOCK_SIZE;
        this.dangerLine = this.add.rectangle(OFFSET_X + WIDTH/2, dangerY, WIDTH, 3, 0xFF3366);
        this.dangerLine.setDepth(20);
        this.add.text(OFFSET_X - 80, dangerY, 'DANGER', {
            fontSize: '14px',
            color: '#FF3366',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);
        this.tweens.add({
            targets: this.dangerLine,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Exit box (outside game area, far right side)
        this.exitBox = {
            x: OFFSET_X + WIDTH + 20,  // Outside game area
            y: OFFSET_Y + HEIGHT - 180,
            width: 140,
            height: 170
        };
        
        const exitBg = this.add.rectangle(
            this.exitBox.x + this.exitBox.width/2,
            this.exitBox.y + this.exitBox.height/2,
            this.exitBox.width,
            this.exitBox.height,
            0x32C832,
            0.3
        );
        exitBg.setStrokeStyle(5, 0x32C832, 0.95);
        exitBg.setDepth(5);
        
        this.add.text(this.exitBox.x + this.exitBox.width/2, this.exitBox.y + 45, 'EXIT', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#32C832',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(6);
        
        this.add.text(this.exitBox.x + this.exitBox.width/2, this.exitBox.y + 95, '✓', {
            fontSize: '48px',
            color: '#32C832'
        }).setOrigin(0.5).setDepth(6);
        
        this.add.text(this.exitBox.x + this.exitBox.width/2, this.exitBox.y + 145, 'Drop Here', {
            fontSize: '16px',
            color: '#AABBCC',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(6);

        // Game state
        this.gridData = Array(this.GRID_HEIGHT).fill().map(() => Array(this.GRID_WIDTH).fill(null));
        this.tetrominoes = []; // Each tetromino is a group of blocks
        this.grabbedPiece = null;
        this.score = 0;
        this.level = 1;
        this.spawnTimer = 0;
        this.spawnInterval = 5000;  // Initial spawn interval
        this.minSpawnInterval = 2000;  // Minimum spawn interval (max difficulty)
        this.gameOver = false;
        this.gameTime = 0;  // Track total game time
        
        // Claw machine automation
        this.isAutoMoving = false;
        this.autoMovePhase = 0; // 0: idle, 1: move to top, 2: move to right, 3: release
        this.autoMoveSpeed = 5;  // Increased from 4 to 5 (1.25x faster)

        // Create claw
        this.createClaw();

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D')
        };
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Track key press to avoid repeating
        this.spacePressed = false;
        this.moveTimer = { left: 0, right: 0, up: 0, down: 0 };
        this.moveDelay = 150; // ms between moves

        // Mobile touch controls
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastTapTime = 0;
        this.doubleTapDelay = 300; // ms for double tap detection
        
        // Make game area interactive for touch
        this.input.on('pointerdown', (pointer) => {
            if (!this.gameOver) {
                const currentTime = this.time.now;
                
                // Check for double tap
                if (currentTime - this.lastTapTime < this.doubleTapDelay) {
                    // Double tap detected - grab/release
                    if (this.grabbedPiece) {
                        this.releasePiece();
                    } else {
                        this.tryGrabAtClaw();
                    }
                    this.lastTapTime = 0; // Reset to prevent triple tap
                } else {
                    // Single tap - start dragging
                    this.lastTapTime = currentTime;
                    this.isDragging = true;
                    this.dragStartX = pointer.x;
                    this.dragStartY = pointer.y;
                }
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging && !this.gameOver) {
                const deltaX = pointer.x - this.dragStartX;
                const deltaY = pointer.y - this.dragStartY;
                
                // Move claw based on drag
                if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                    this.moveClaw(deltaX * 0.625, deltaY * 0.625);  // Increased from 0.5 to 0.625 (1.25x faster)
                    
                    // Update grabbed piece position
                    if (this.grabbedPiece) {
                        this.syncGrabbedPieceToClaw();
                    }
                    
                    this.dragStartX = pointer.x;
                    this.dragStartY = pointer.y;
                }
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // UI
        this.createUI();

        // Menu button
        this.createMenuButton();

        // Spawn initial pieces
        this.spawnTetromino();
        this.spawnTetromino();
    }

    createClaw() {
        const WIDTH = this.BLOCK_SIZE * this.GRID_WIDTH;
        const HEIGHT = this.BLOCK_SIZE * this.GRID_HEIGHT;
        
        // Rope graphics (drawn dynamically)
        this.ropeGraphics = this.add.graphics();
        this.ropeGraphics.setDepth(99);
        
        // Claw container
        this.claw = this.add.container(
            this.offsetX + WIDTH/2,
            this.offsetY + 60
        );
        this.claw.setDepth(100);

        // Claw arms (like grabber)
        const clawGraphics = this.add.graphics();
        
        // Left arm
        clawGraphics.fillStyle(0xFFCC00, 0.9);
        clawGraphics.fillRect(-15, -5, 10, 25);
        clawGraphics.fillTriangle(-15, 20, -5, 20, -10, 28);
        
        // Right arm
        clawGraphics.fillRect(5, -5, 10, 25);
        clawGraphics.fillTriangle(5, 20, 15, 20, 10, 28);
        
        // Center body
        clawGraphics.fillStyle(0xFFDD33, 1);
        clawGraphics.fillRoundedRect(-8, -8, 16, 12, 3);
        
        clawGraphics.generateTexture('claw_texture', 32, 36);
        clawGraphics.destroy();

        this.clawSprite = this.add.image(0, 0, 'claw_texture');
        this.claw.add(this.clawSprite);

        // Claw bounds - game area for normal play
        this.clawBounds = {
            minX: this.offsetX + 15,
            maxX: this.offsetX + WIDTH - 15,
            minY: this.offsetY + 15,
            maxY: this.offsetY + HEIGHT - 15
        };
        
        // Extended bounds for auto-delivery (can go outside to EXIT)
        this.clawExtendedBounds = {
            minX: this.offsetX + 15,
            maxX: this.exitBox.x + this.exitBox.width,  // Can reach EXIT box
            minY: this.offsetY + 15,
            maxY: this.offsetY + HEIGHT - 15
        };
        
        console.log(`Claw bounds: normal maxX=${this.clawBounds.maxX}, extended maxX=${this.clawExtendedBounds.maxX}`);
        console.log(`EXIT box at x=${this.exitBox.x}, width=${this.exitBox.width}`);

        // Claw grab zone (collision area)
        this.clawGrabZone = this.add.rectangle(0, 18, 30, 30, 0xFF0000, 0);
        this.claw.add(this.clawGrabZone);
        
        // Initial rope draw
        this.ropeGraphics.clear();
        this.ropeGraphics.lineStyle(3, 0xFFD700, 0.8);
        this.ropeGraphics.lineBetween(
            this.claw.x, this.offsetY,
            this.claw.x, this.claw.y - 15
        );
    }

    createUI() {
        // Score panel (top left, larger)
        const scorePanel = this.add.rectangle(30, 30, 220, 110, 0x1a1a2e, 0.85);
        scorePanel.setStrokeStyle(3, 0x5e72e4, 0.8);
        scorePanel.setOrigin(0, 0);
        scorePanel.setDepth(200);

        this.add.text(140, 50, 'SCORE', {
            fontSize: '18px',
            color: '#8899AA',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);

        this.scoreText = this.add.text(140, 90, '0', {
            fontSize: '38px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);

        // Instructions (bottom center)
        this.instructionText = this.add.text(350, 740, 'Grab blocks - Claw moves to top-right & drops!  •  PC: WASD+SPACE  Mobile: Drag+DoubleTap', {
            fontSize: '12px',
            color: '#AABBCC',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);
        
        // Controls panel (left side)
        this.createControlsPanel();
    }
    
    createControlsPanel() {
        const panelX = 30;
        const panelY = 200;
        const panelWidth = 140;
        const panelHeight = 280;
        
        // Panel background
        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x1a1a2e, 0.85);
        panel.setStrokeStyle(3, 0x5e72e4, 0.8);
        panel.setOrigin(0, 0);
        panel.setDepth(200);
        
        // Title
        this.add.text(panelX + panelWidth/2, panelY + 20, 'CONTROLS', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#5e72e4',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(201);
        
        // PC Controls
        this.add.text(panelX + panelWidth/2, panelY + 50, 'PC:', {
            fontSize: '14px',
            color: '#8899FF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);
        
        const pcControls = [
            'W A S D',
            'Move Claw',
            '',
            'SPACE',
            'Grab Block'
        ];
        
        pcControls.forEach((text, index) => {
            const fontSize = (index === 0 || index === 3) ? '13px' : '11px';
            const color = (index === 0 || index === 3) ? '#FFDD88' : '#AABBCC';
            const bold = (index === 0 || index === 3) ? 'bold' : 'normal';
            
            this.add.text(panelX + panelWidth/2, panelY + 70 + index * 20, text, {
                fontSize: fontSize,
                color: color,
                fontStyle: bold
            }).setOrigin(0.5).setDepth(201);
        });
        
        // Mobile Controls
        this.add.text(panelX + panelWidth/2, panelY + 180, 'Mobile:', {
            fontSize: '14px',
            color: '#8899FF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);
        
        const mobileControls = [
            'Drag',
            'Move Claw',
            '',
            'Double Tap',
            'Grab Block'
        ];
        
        mobileControls.forEach((text, index) => {
            const fontSize = (index === 0 || index === 3) ? '13px' : '11px';
            const color = (index === 0 || index === 3) ? '#FFDD88' : '#AABBCC';
            const bold = (index === 0 || index === 3) ? 'bold' : 'normal';
            
            this.add.text(panelX + panelWidth/2, panelY + 200 + index * 20, text, {
                fontSize: fontSize,
                color: color,
                fontStyle: bold
            }).setOrigin(0.5).setDepth(201);
        });
    }

    createMenuButton() {
        const btn = this.add.rectangle(620, 50, 120, 50, 0x5E72E4, 0.85);
        btn.setStrokeStyle(3, 0x8899FF);
        btn.setInteractive();
        btn.setDepth(200);

        const label = this.add.text(620, 50, 'MENU', {
            fontSize: '20px',
            color: '#FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);

        btn.on('pointerover', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150
            });
        });

        btn.on('pointerout', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });

        btn.on('pointerdown', () => {
            this.showPauseMenu();
        });
    }

    showPauseMenu() {
        this.scene.pause();
        
        const overlay = this.add.rectangle(350, 400, 700, 800, 0x000000, 0.8);
        overlay.setDepth(300);
        overlay.setInteractive();

        const panel = this.add.rectangle(350, 400, 400, 300, 0x1a1a2e, 0.95);
        panel.setStrokeStyle(3, 0x5E72E4);
        panel.setDepth(301);

        const title = this.add.text(350, 300, 'PAUSED', {
            fontSize: '42px',
            color: '#FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(302);

        // Resume button
        const resumeBtn = this.add.rectangle(350, 380, 200, 50, 0x32C832, 0.8);
        resumeBtn.setStrokeStyle(2, 0x4AE84A);
        resumeBtn.setInteractive();
        resumeBtn.setDepth(302);

        const resumeText = this.add.text(350, 380, 'RESUME', {
            fontSize: '20px',
            color: '#FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(303);

        resumeBtn.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            resumeBtn.destroy();
            resumeText.destroy();
            restartBtn.destroy();
            restartText.destroy();
            menuBtn.destroy();
            menuText.destroy();
            this.scene.resume();
        });

        // Restart button
        const restartBtn = this.add.rectangle(350, 450, 200, 50, 0xF0A000, 0.8);
        restartBtn.setStrokeStyle(2, 0xFFB820);
        restartBtn.setInteractive();
        restartBtn.setDepth(302);

        const restartText = this.add.text(350, 450, 'RESTART', {
            fontSize: '20px',
            color: '#FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(303);

        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });

        // Main menu button
        const menuBtn = this.add.rectangle(350, 520, 200, 50, 0xFF3366, 0.8);
        menuBtn.setStrokeStyle(2, 0xFF5588);
        menuBtn.setInteractive();
        menuBtn.setDepth(302);

        const menuText = this.add.text(350, 520, 'MAIN MENU', {
            fontSize: '20px',
            color: '#FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(303);

        menuBtn.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('MenuScene');
        });
    }

    spawnTetromino() {
        const shapes = Object.keys(TETROMINO_SHAPES);
        const shapeKey = Phaser.Utils.Array.GetRandom(shapes);
        const shape = TETROMINO_SHAPES[shapeKey];
        
        // Random horizontal position
        const startCol = Phaser.Math.Between(1, this.GRID_WIDTH - 5);
        
        // Find highest occupied position in this column range to stack on top
        let highestRow = this.GRID_HEIGHT - 1;
        for (let col = startCol; col < startCol + 4; col++) {
            if (col >= this.GRID_WIDTH) break;
            for (let row = 0; row < this.GRID_HEIGHT; row++) {
                if (this.gridData[row][col] !== null) {
                    highestRow = Math.min(highestRow, row - 1);
                    break;
                }
            }
        }

        const tetromino = {
            type: shapeKey,
            blocks: [],
            gridPositions: [],
            grabbed: false,
            container: null
        };

        // Calculate bounds for centering
        let minX = 999, maxX = -999, minY = 999, maxY = -999;
        shape.blocks.forEach(([bx, by]) => {
            minX = Math.min(minX, bx);
            maxX = Math.max(maxX, bx);
            minY = Math.min(minY, by);
            maxY = Math.max(maxY, by);
        });

        const offsetBx = (minX + maxX) / 2;
        const offsetBy = (minY + maxY) / 2;

        // Create a container to hold the entire tetromino shape
        const centerX = this.offsetX + (startCol + 1.5) * this.BLOCK_SIZE;
        const centerY = this.offsetY + (highestRow - offsetBy) * this.BLOCK_SIZE;
        
        tetromino.container = this.add.container(centerX, centerY);
        tetromino.container.setDepth(10);

        // Create blocks relative to container
        shape.blocks.forEach(([bx, by]) => {
            const gridX = startCol + bx;
            const gridY = highestRow - by;
            
            if (gridX >= 0 && gridX < this.GRID_WIDTH && gridY >= 0 && gridY < this.GRID_HEIGHT) {
                const block = this.add.image(
                    (bx - offsetBx) * this.BLOCK_SIZE,
                    -(by - offsetBy) * this.BLOCK_SIZE,
                    `block_${shapeKey}`
                );
                
                tetromino.container.add(block);
                tetromino.blocks.push(block);
                tetromino.gridPositions.push({ x: gridX, y: gridY });
                this.gridData[gridY][gridX] = tetromino;
            }
        });

        // Spawn animation - fall from above
        tetromino.container.y -= 100;
        this.tweens.add({
            targets: tetromino.container,
            y: centerY,
            duration: 400,
            ease: 'Bounce.easeOut'
        });

        this.tetrominoes.push(tetromino);
        this.checkGameOver();
    }

    update(time, delta) {
        if (this.gameOver) return;

        // Track game time and increase difficulty
        this.gameTime += delta;
        
        // Decrease spawn interval over time (faster spawning)
        // Every 30 seconds, reduce interval by 200ms until minimum
        const secondsElapsed = Math.floor(this.gameTime / 1000);
        const difficultyLevel = Math.floor(secondsElapsed / 30);
        this.spawnInterval = Math.max(
            this.minSpawnInterval,
            5000 - (difficultyLevel * 200)
        );

        // Spawn timer
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnTetromino();
        }

        // Apply gravity to pieces not grabbed
        this.applyGravity(delta);

        // Auto-move claw to exit after grabbing
        if (this.isAutoMoving && this.grabbedPiece) {
            this.autoMoveToExit();
            return; // Skip manual control during auto movement
        }

        // Update timers
        for (let key in this.moveTimer) {
            if (this.moveTimer[key] > 0) {
                this.moveTimer[key] -= delta;
            }
        }

        // WASD controls - smooth continuous movement
        const moveSpeed = 3.75;  // Increased from 3 to 3.75 (1.25x faster)
        
        // A - Move LEFT
        if (this.wasd.left.isDown && !this.isAutoMoving) {
            this.moveClaw(-moveSpeed, 0);
            if (this.grabbedPiece) {
                this.syncGrabbedPieceToClaw();
            }
        }
        
        // D - Move RIGHT
        if (this.wasd.right.isDown && !this.isAutoMoving) {
            this.moveClaw(moveSpeed, 0);
            if (this.grabbedPiece) {
                this.syncGrabbedPieceToClaw();
            }
        }
        
        // W - Move UP
        if (this.wasd.up.isDown && !this.isAutoMoving) {
            this.moveClaw(0, -moveSpeed);
            if (this.grabbedPiece) {
                this.syncGrabbedPieceToClaw();
            }
        }
        
        // S - Move DOWN
        if (this.wasd.down.isDown && !this.isAutoMoving) {
            this.moveClaw(0, moveSpeed);
            if (this.grabbedPiece) {
                this.syncGrabbedPieceToClaw();
            }
        }

        // Grab with Space (auto-moves to exit after grabbing)
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isAutoMoving) {
            if (!this.grabbedPiece) {
                this.tryGrabAtClaw();
            }
        }
    }

    applyGravity(delta) {
        if (!this.gravityTimer) this.gravityTimer = 0;
        this.gravityTimer += delta;
        
        // Apply gravity every 100ms for smooth falling
        if (this.gravityTimer < 100) return;
        this.gravityTimer = 0;
        
        console.log(`=== Gravity check: ${this.tetrominoes.length} pieces ===`);
        
        this.tetrominoes.forEach((tetromino, idx) => {
            console.log(`Piece ${idx}: grabbed=${tetromino.grabbed}, container.y=${tetromino.container.y}`);
            if (tetromino.grabbed) return; // Skip grabbed pieces
            
            // Check if piece is below screen (fell off)
            const bottomY = this.offsetY + this.GRID_HEIGHT * this.BLOCK_SIZE;
            if (tetromino.container.y > bottomY + 100) {
                return; // Will be cleaned up by checkFallingPieceInExit
            }
            
            // Check if can fall (check each block position)
            let canFall = true;
            console.log(`  Checking fall: gridPos count=${tetromino.gridPositions.length}`);
            
            for (let pos of tetromino.gridPositions) {
                console.log(`    Block at grid(${pos.x}, ${pos.y})`);
                const newY = pos.y + 1;
                
                // If outside game area horizontally (like in EXIT zone), just check bottom
                if (pos.x < 0 || pos.x >= this.GRID_WIDTH) {
                    console.log(`      Outside game area, newY=${newY}, GRID_HEIGHT=${this.GRID_HEIGHT}`);
                    // Check if hit bottom of screen
                    if (newY >= this.GRID_HEIGHT) {
                        canFall = false;
                        console.log(`      Hit bottom!`);
                        break;
                    }
                    continue; // No grid collision check needed outside game area
                }
                
                // Normal grid collision check
                if (newY >= this.GRID_HEIGHT) {
                    canFall = false;
                    console.log(`      Hit bottom (in game area)!`);
                    break;
                }
                
                // Check collision with other pieces (safe array access)
                if (pos.x >= 0 && pos.x < this.GRID_WIDTH) {
                    const occupant = this.gridData[newY][pos.x];
                    if (occupant && occupant !== tetromino) {
                        canFall = false;
                        console.log(`      Hit another piece!`);
                        break;
                    }
                }
            }
            
            console.log(`  canFall=${canFall}`);
            
            if (canFall) {
                // Clear old positions (only if in grid)
                tetromino.gridPositions.forEach(pos => {
                    if (pos.x >= 0 && pos.x < this.GRID_WIDTH && 
                        pos.y >= 0 && pos.y < this.GRID_HEIGHT) {
                        this.gridData[pos.y][pos.x] = null;
                    }
                });
                
                // Update positions
                tetromino.gridPositions.forEach(pos => {
                    pos.y++;
                });
                
                // Set new positions (only if in grid)
                tetromino.gridPositions.forEach(pos => {
                    if (pos.x >= 0 && pos.x < this.GRID_WIDTH && 
                        pos.y >= 0 && pos.y < this.GRID_HEIGHT) {
                        this.gridData[pos.y][pos.x] = tetromino;
                    }
                });
                
                // Move container visually
                tetromino.container.y += this.BLOCK_SIZE;
                console.log(`  Moved down to y=${tetromino.container.y}`);
            }
        });
    }

    autoMoveToExit() {
        if (!this.grabbedPiece) {
            this.isAutoMoving = false;
            this.autoMovePhase = 0;
            return;
        }
        
        // Phase 1: Move to top
        if (this.autoMovePhase === 1) {
            const targetY = this.clawBounds.minY + 20;
            const dy = targetY - this.claw.y;
            
            if (Math.abs(dy) < 5) {
                // Reached top, move to phase 2
                this.autoMovePhase = 2;
            } else {
                // Move upward (normal bounds)
                const moveY = dy > 0 ? this.autoMoveSpeed : -this.autoMoveSpeed;
                this.moveClaw(0, moveY, false);
                this.syncGrabbedPieceToClaw();
            }
        }
        // Phase 2: Move to EXIT box (outside game area)
        else if (this.autoMovePhase === 2) {
            // Target: center of EXIT box (outside game area)
            const targetX = this.exitBox.x + this.exitBox.width / 2;
            const dx = targetX - this.claw.x;
            
            console.log(`Phase 2: Moving to EXIT, claw.x=${this.claw.x}, targetX=${targetX}, dx=${dx}`);
            
            if (Math.abs(dx) < 10) {
                // Reached EXIT position, release piece
                console.log(`Reached EXIT! Releasing...`);
                this.autoMovePhase = 3;
                this.releasePieceFromTop();
            } else {
                // Move right (use extended bounds to go outside)
                const moveX = dx > 0 ? this.autoMoveSpeed : -this.autoMoveSpeed;
                this.moveClaw(moveX, 0, true);  // Use extended bounds!
                this.syncGrabbedPieceToClaw();
            }
        }
    }
    
    releasePieceFromTop() {
        if (!this.grabbedPiece) return;
        
        // Flash effect on piece before release
        this.tweens.add({
            targets: this.grabbedPiece.container,
            alpha: 0.7,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 150,
            yoyo: true,
            onComplete: () => {
                // Remove glow
                this.grabbedPiece.blocks.forEach(block => {
                    block.clearTint();
                });
                
                // Store reference before clearing
                const releasedPiece = this.grabbedPiece;
                
                // Update grid positions based on current container position
                const containerX = releasedPiece.container.x;
                const containerY = releasedPiece.container.y;
                const gridX = Math.round((containerX - this.offsetX) / this.BLOCK_SIZE);
                const gridY = Math.round((containerY - this.offsetY) / this.BLOCK_SIZE);
                
                console.log(`Releasing piece at grid(${gridX}, ${gridY}), pixel(${containerX}, ${containerY})`);
                console.log(`EXIT box is outside game area at x:${this.exitBox.x}`);
                
                // Update each block's grid position relative to container
                releasedPiece.gridPositions.forEach((pos, index) => {
                    const blockData = TETROMINO_SHAPES[releasedPiece.type].blocks[index];
                    // blockData is [x, y] array, not {x, y} object
                    pos.x = gridX + blockData[0];
                    pos.y = gridY + blockData[1];
                    
                    console.log(`  Block ${index}: grid(${pos.x}, ${pos.y})`);
                    
                    // Mark in grid if within bounds
                    if (pos.x >= 0 && pos.x < this.GRID_WIDTH && 
                        pos.y >= 0 && pos.y < this.GRID_HEIGHT) {
                        this.gridData[pos.y][pos.x] = releasedPiece;
                    }
                });
                
                // Release and let gravity take over
                releasedPiece.grabbed = false;
                releasedPiece.container.setDepth(10);
                
                // Enable collision detection when it reaches exit box
                this.time.delayedCall(100, () => {
                    this.checkFallingPieceInExit();
                });
                
                this.grabbedPiece = null;
                this.isAutoMoving = false;
                this.autoMovePhase = 0;
            }
        });
        
        // Claw release animation
        this.tweens.add({
            targets: this.clawSprite,
            scaleX: 1.1,
            scaleY: 0.9,
            duration: 150,
            yoyo: true
        });
    }
    
    checkFallingPieceInExit() {
        // Monitor pieces falling into exit box
        this.checkExitTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                this.tetrominoes.forEach(tetromino => {
                    if (tetromino.grabbed) return;
                    
                    const bounds = tetromino.container.getBounds();
                    const exitBounds = new Phaser.Geom.Rectangle(
                        this.exitBox.x,
                        this.exitBox.y,
                        this.exitBox.width,
                        this.exitBox.height
                    );
                    
                    // Check if piece center is in exit box
                    if (Phaser.Geom.Rectangle.Contains(exitBounds, bounds.centerX, bounds.centerY)) {
                        this.scorePieceInExit(tetromino);
                        if (this.checkExitTimer) {
                            this.checkExitTimer.remove();
                        }
                    }
                });
            },
            loop: true
        });
    }
    
    scorePieceInExit(tetromino) {
        if (!tetromino || !tetromino.container) return;
        
        // Particle explosion
        const centerX = tetromino.container.x;
        const centerY = tetromino.container.y;
        
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const particle = this.add.circle(
                centerX, centerY, 4,
                TETROMINO_SHAPES[tetromino.type].color, 0.9
            );
            particle.setDepth(100);
            
            this.tweens.add({
                targets: particle,
                x: centerX + Math.cos(angle) * 150,
                y: centerY + Math.sin(angle) * 150,
                alpha: 0,
                duration: 700,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        // Destroy piece
        tetromino.container.destroy();
        this.tetrominoes = this.tetrominoes.filter(t => t !== tetromino);
        
        // Score
        this.score += 100;
        this.scoreText.setText(this.score.toString());
        
        // Flash exit box
        this.tweens.add({
            targets: this.add.rectangle(
                this.exitBox.x + this.exitBox.width/2,
                this.exitBox.y + this.exitBox.height/2,
                this.exitBox.width,
                this.exitBox.height,
                0x32C832,
                0.5
            ).setDepth(100),
            alpha: 0,
            duration: 300,
            onComplete: (tween, targets) => {
                targets[0].destroy();
            }
        });
    }



    moveClaw(dx, dy, useExtendedBounds = false) {
        const bounds = useExtendedBounds ? this.clawExtendedBounds : this.clawBounds;
        
        this.claw.x = Phaser.Math.Clamp(
            this.claw.x + dx,
            bounds.minX,
            bounds.maxX
        );
        this.claw.y = Phaser.Math.Clamp(
            this.claw.y + dy,
            bounds.minY,
            bounds.maxY
        );
        
        // Update rope
        this.ropeGraphics.clear();
        this.ropeGraphics.lineStyle(3, 0xFFD700, 0.8);
        this.ropeGraphics.lineBetween(
            this.claw.x, this.offsetY,
            this.claw.x, this.claw.y - 15
        );
    }

    syncGrabbedPieceToClaw() {
        if (!this.grabbedPiece) return;
        
        // Keep piece attached to claw
        this.grabbedPiece.container.x = this.claw.x;
        this.grabbedPiece.container.y = this.claw.y + 35;
    }

    tryGrabAtClaw() {
        // Find piece that intersects with claw
        const clawX = this.claw.x;
        const clawY = this.claw.y + 20; // Check below claw
        const grabRadius = 40; // Larger grab radius

        // Find closest piece to claw
        let closestPiece = null;
        let closestDist = Infinity;

        this.tetrominoes.forEach(t => {
            if (t.grabbed || t.blocks.length === 0) return;
            
            const dist = Phaser.Math.Distance.Between(
                clawX, clawY,
                t.container.x, t.container.y
            );
            
            if (dist < grabRadius && dist < closestDist) {
                closestDist = dist;
                closestPiece = t;
            }
        });

        if (!closestPiece) {
            console.log('No piece found near claw!');
            return;
        }

        console.log('Grabbed piece type:', closestPiece.type);

        this.grabbedPiece = closestPiece;
        this.grabbedPiece.grabbed = true;

        // Remove from grid
        this.grabbedPiece.gridPositions.forEach(pos => {
            if (pos.y >= 0 && pos.y < this.GRID_HEIGHT && pos.x >= 0 && pos.x < this.GRID_WIDTH) {
                this.gridData[pos.y][pos.x] = null;
            }
        });

        // Attach to claw visually
        this.tweens.add({
            targets: this.grabbedPiece.container,
            x: this.claw.x,
            y: this.claw.y + 35,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Start auto-move: Phase 1 = move to top
                this.isAutoMoving = true;
                this.autoMovePhase = 1;
            }
        });
        this.grabbedPiece.container.setDepth(90);

        // Claw grab animation
        this.tweens.add({
            targets: this.clawSprite,
            scaleX: 0.9,
            scaleY: 1.1,
            duration: 100,
            yoyo: true
        });

        // Add glow effect
        this.grabbedPiece.blocks.forEach(block => {
            block.setTint(0xFFFFFF);
        });
    }



    releasePiece() {
        if (!this.grabbedPiece) return;

        this.grabbedPiece.grabbed = false;
        
        // Just drop at current position
        const currentX = this.grabbedPiece.container.x;
        const currentY = this.grabbedPiece.container.y;

        // Update grid positions based on current position
        const shape = TETROMINO_SHAPES[this.grabbedPiece.type];
        
        // Calculate new grid positions
        const gridCenterX = Math.round((currentX - this.offsetX) / this.BLOCK_SIZE);
        const gridCenterY = Math.round((currentY - this.offsetY) / this.BLOCK_SIZE);

        this.grabbedPiece.gridPositions = [];
        
        shape.blocks.forEach(([bx, by], i) => {
            const gridX = gridCenterX + bx - 1;
            const gridY = gridCenterY - by;
            
            this.grabbedPiece.gridPositions.push({ x: gridX, y: gridY });
            
            if (gridX >= 0 && gridX < this.GRID_WIDTH && gridY >= 0 && gridY < this.GRID_HEIGHT) {
                this.gridData[gridY][gridX] = this.grabbedPiece;
            }
        });

        // Reset visual
        this.tweens.add({
            targets: this.grabbedPiece.container,
            scaleX: 1,
            scaleY: 1,
            duration: 200
        });
        this.grabbedPiece.container.setDepth(10);
        
        // Claw release animation
        this.tweens.add({
            targets: this.clawSprite,
            scaleX: 1.1,
            scaleY: 0.95,
            duration: 100,
            yoyo: true
        });

        // Clear tint
        this.grabbedPiece.blocks.forEach(block => {
            block.clearTint();
        });

        this.grabbedPiece = null;
    }

    checkExitBox() {
        if (!this.grabbedPiece) return;

        // Check if any part of the piece is inside exit box (more lenient)
        const containerX = this.grabbedPiece.container.x;
        const containerY = this.grabbedPiece.container.y;
        
        // Expanded check area
        const margin = 30;
        const inBox = containerX >= this.exitBox.x - margin &&
                      containerX <= this.exitBox.x + this.exitBox.width + margin &&
                      containerY >= this.exitBox.y - margin &&
                      containerY <= this.exitBox.y + this.exitBox.height + margin;

        if (inBox) {
            this.deliverPiece();
        }
    }

    deliverPiece() {
        // Particle explosion from container center
        const centerX = this.grabbedPiece.container.x;
        const centerY = this.grabbedPiece.container.y;
        
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const particle = this.add.circle(
                centerX, centerY, 4,
                TETROMINO_SHAPES[this.grabbedPiece.type].color, 0.9
            );
            particle.setDepth(100);
            
            this.tweens.add({
                targets: particle,
                x: centerX + Math.cos(angle) * 150,
                y: centerY + Math.sin(angle) * 150,
                alpha: 0,
                duration: 700,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        // Destroy container and all blocks
        this.grabbedPiece.container.destroy();

        // Score
        this.score += 100;
        this.scoreText.setText(this.score.toString());

        // Remove from array
        this.tetrominoes = this.tetrominoes.filter(t => t !== this.grabbedPiece);
        this.grabbedPiece = null;

        // Flash exit box
        this.tweens.add({
            targets: this.exitBox,
            alpha: 0.5,
            duration: 200,
            yoyo: true
        });
    }

    checkGameOver() {
        // Check if any blocks are at or above danger line
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y <= this.DANGER_LINE; y++) {
                if (this.gridData[y][x]) {
                    this.triggerGameOver();
                    return;
                }
            }
        }
    }

    triggerGameOver() {
        this.gameOver = true;
        
        const overlay = this.add.rectangle(350, 400, 700, 800, 0x000000, 0.85);
        overlay.setDepth(300);

        const gameOverText = this.add.text(350, 300, 'GAME OVER', {
            fontSize: '52px',
            color: '#FF3366',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(301);

        const scoreText = this.add.text(350, 380, 'Score: ' + this.score, {
            fontSize: '32px',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(301);

        // Restart button
        const restartBtn = this.add.rectangle(350, 480, 200, 50, 0x32C832, 0.8);
        restartBtn.setStrokeStyle(2, 0x4AE84A);
        restartBtn.setInteractive();
        restartBtn.setDepth(302);

        const restartText = this.add.text(350, 480, 'RESTART', {
            fontSize: '20px',
            color: '#FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(303);

        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });

        // Menu button
        const menuBtn = this.add.rectangle(350, 550, 200, 50, 0xFF3366, 0.8);
        menuBtn.setStrokeStyle(2, 0xFF5588);
        menuBtn.setInteractive();
        menuBtn.setDepth(302);

        const menuText = this.add.text(350, 550, 'MAIN MENU', {
            fontSize: '20px',
            color: '#FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(303);

        menuBtn.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('MenuScene');
        });
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 700,
    height: 800,
    backgroundColor: '#0a0a0f',
    scene: [MenuScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 700,
        height: 800
    },
    // Disable context menu on mobile
    input: {
        touch: {
            capture: true
        }
    }
};

const game = new Phaser.Game(config);
