# 🎮 Tetris Claw - Block Grabbing Arcade Game

**Play Now:** [https://mckenzieaaa.github.io/Prize-Claw/](https://mckenzieaaa.github.io/Prize-Claw/)

A modern web-based claw machine game that combines the excitement of arcade claw machines with Tetris-style block mechanics. Grab falling tetromino blocks with a mechanical claw and drop them into the EXIT zone to score points!

## 🎯 How to Play

### Game Objective
- Control a mechanical claw to grab falling Tetris blocks
- The claw automatically lifts grabbed blocks to the top
- Moves them to the right-side EXIT zone
- Blocks drop into the EXIT box to earn points
- Clear blocks before they reach the danger line!

### Controls

#### 🖥️ PC/Desktop
- **W A S D** or **Arrow Keys** - Move the claw in any direction
- **SPACE** - Grab/release blocks
- The claw automatically delivers grabbed blocks to the EXIT zone

#### 📱 Mobile/Touch
- **Drag** - Move the claw anywhere on screen
- **Double Tap** - Grab/release blocks
- Smooth touch controls with visual feedback

### Gameplay Features
- **Progressive Difficulty**: Blocks spawn faster as time goes on
  - Starts at 5 seconds per block
  - Speeds up to 2 seconds per block over time
- **Gravity System**: Blocks naturally fall and stack
- **Auto-Delivery**: Grabbed blocks are automatically transported to EXIT
- **Score System**: 100 points per block delivered
- **Danger Line**: Game over if blocks stack too high

## 🎨 Game Elements

### Tetromino Shapes
The game features all 7 classic Tetris pieces:
- **I** (Cyan) - 4-block line
- **O** (Yellow) - 2×2 square
- **T** (Purple) - T-shape
- **S** (Green) - S-shape
- **Z** (Red) - Z-shape
- **J** (Blue) - J-shape
- **L** (Orange) - L-shape

### Visual Design
- Modern glassmorphism UI
- Particle effects and animations
- Responsive layout for all screen sizes
- Smooth claw movement with rope physics
- Glowing block effects when grabbed

## 🛠️ Technology Stack

- **Framework**: Phaser 3 (v3.70.0)
- **Language**: JavaScript
- **Graphics**: WebGL rendering
- **Audio**: Web Audio API
- **Deployment**: GitHub Pages

## 🚀 Development

### Project Structure
```
docs/
├── index.html          # Main HTML entry point
├── tetris-claw.js      # Game logic and scenes
└── old_tetris_claw.js  # Backup version

python_game/            # Legacy Pygame version
├── main.py
├── prize_templates.py
└── generate_prizes.py
```

### Local Development
Simply open `docs/index.html` in a modern web browser, or run a local server:

```bash
# Using Python
cd docs
python -m http.server 8000

# Using Node.js
npx http-server docs -p 8000
```

Then visit `http://localhost:8000`

## 🎮 Game Mechanics

### Claw Movement
- Manual control: Move the claw anywhere within the game area
- Speed: 3.75 pixels/frame (1.25× faster than original)
- Extended bounds: Can reach outside game area to EXIT zone

### Auto-Delivery System
1. **Phase 1**: Grab block with SPACE/double-tap
2. **Phase 2**: Claw automatically rises to top
3. **Phase 3**: Claw moves horizontally to EXIT zone
4. **Phase 4**: Releases block to fall into EXIT
5. **Phase 5**: Collision detection awards points

### Difficulty Progression
Time elapsed | Spawn interval
--- | ---
0-30s | 5.0 seconds
30-60s | 4.8 seconds
60-90s | 4.6 seconds
... | ...
450s+ | 2.0 seconds (max)

## 📱 Responsive Design

The game automatically adapts to different screen sizes:
- Desktop: Full-featured controls and layout
- Tablet: Touch-optimized with adjusted UI
- Mobile: Compact layout, drag controls, double-tap grab

## 🎯 Future Enhancements

- [ ] Sound effects and background music
- [ ] High score leaderboard
- [ ] Power-ups and special blocks
- [ ] Multiple difficulty modes
- [ ] Combo system for consecutive deliveries
- [ ] Achievement system

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Credits

Built with [Phaser 3](https://phaser.io/) game framework.

---

**Play the game now:** [https://mckenzieaaa.github.io/Prize-Claw/](https://mckenzieaaa.github.io/Prize-Claw/)
