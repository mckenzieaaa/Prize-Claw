# Changelog - Tetris Claw Python Version

All notable changes to the Python version of Tetris Claw will be documented in this file.

## [Version 1.1.0] - 2025-10-25

### ✨ Added
- **Mode Selection Screen** - New screen for choosing between game modes
  - Visual mode cards with high score display
  - Keyboard navigation (W/S to select, SPACE to confirm)
  - High score tracking for each mode
  - Clean, modern UI design

- **Time Attack Mode** - 60-second challenge mode
  - Countdown timer with color-coded urgency
  - Timer colors: White (>20s) → Yellow (>10s) → Red (≤10s)
  - Automatic high score tracking
  - Game over screen when time expires

- **Levels Mode** - 10-level progression system
  - Progressive difficulty: Level 1 (5 pieces) → Level 10 (23 pieces)
  - Level-specific goals with progress tracking
  - Level completion screen between levels
  - Score persistence across all levels
  - Victory screen after completing all 10 levels

- **Game Over Screen** - End game display
  - Final score presentation
  - High score comparison and "New High Score!" notification
  - Return to mode selection option

- **Level Complete Screen** - Inter-level transition
  - Level completion celebration
  - Current score display
  - Continue prompt for next level

### 🎮 Improved
- **Game State Management** - Enhanced mode system
  - Added GAME_OVER state
  - Added LEVEL_COMPLETE state
  - Added MODE_SELECT state
  - Better state transitions and navigation

- **HUD System** - Mode-specific displays
  - Endless: Score only
  - Time Attack: Score + countdown timer with color coding
  - Levels: Score + level number + progress counter

- **Navigation Flow**
  - ESC from gameplay returns to mode select (not menu)
  - ESC from mode select returns to main menu
  - ESC from main menu quits game
  - Consistent back-navigation throughout

### 🔧 Technical
- High score storage in memory (dictionary-based)
- Separate reset_game() method for clean mode initialization
- next_level() method for level progression
- Dynamic level goal calculation: `5 + (level - 1) * 2`

### 📚 Documentation
- Created GAMEPLAY.md with comprehensive gameplay guide
- Created SCREENSHOTS.md with visual interface documentation
- Updated README.md with new features
- Added detailed mode descriptions and tips

---

## [Version 1.0.0] - 2025-10-24

### 🎉 Initial Release
- **Core Gameplay** - Python/Pygame port of JavaScript version
  - Endless mode with progressive difficulty
  - WASD + Space controls
  - Smooth claw movement system
  - Auto-delivery to EXIT zone

- **Tetromino System**
  - 7 classic shapes (I, O, T, S, Z, J, L)
  - Bottom-up spawning mechanics
  - Grid-based collision detection
  - Colored blocks with highlighting

- **Visual Features**
  - 700×800 resolution
  - 8×14 block grid
  - Grid lines and danger line
  - EXIT zone visualization
  - Smooth 60 FPS rendering

- **Claw Mechanics**
  - Multi-threshold movement (smooth acceleration/deceleration)
  - Expanded grab area (±20px)
  - Target position reset after delivery
  - State machine (idle, moving, grabbing, delivering)

- **UI Elements**
  - Main menu screen
  - Score display
  - Control instructions
  - Clean, modern design

- **Documentation**
  - README.md with installation instructions
  - Feature comparison with web version
  - Controls documentation

---

## 🔮 Planned Features (Future Versions)

### [Version 1.2.0] - Upcoming
- **VS Mode** - 2-player split-screen competition
  - Dual claw systems (WASD vs Arrow keys)
  - 30-second competitive timer
  - Split-screen rendering (350px each side)
  - Winner determination and display

### [Version 1.3.0] - Future
- **Pause System**
  - Pause/resume functionality
  - Pause menu overlay
  - Resume/Restart/Quit options

- **Sound System**
  - Background music
  - Grab sound effect
  - Delivery sound effect
  - Timer warning beeps
  - Level complete fanfare
  - Game over sound

### [Version 1.4.0] - Future
- **Enhanced Graphics**
  - Particle effects for deliveries
  - Smooth animations
  - Gradient backgrounds
  - Shadow effects
  - Block rotation animations

### [Version 1.5.0] - Future
- **Persistent Storage**
  - Save high scores to file (JSON)
  - Load high scores on startup
  - Settings persistence
  - Player profiles

### [Version 2.0.0] - Future
- **Additional Modes**
  - Challenge mode (specific objectives)
  - Zen mode (relaxed, no scoring)
  - Speed mode (faster spawning)
  - Puzzle mode (pre-set arrangements)

- **Online Features**
  - Leaderboard system
  - Replay sharing
  - Daily challenges

---

## 📊 Version Comparison

| Version | Game Modes | Features | Lines of Code |
|---------|-----------|----------|---------------|
| 1.0.0   | 1         | Basic gameplay | ~410 |
| 1.1.0   | 3         | Full mode system | ~540 |
| 1.2.0   | 4         | VS Mode (planned) | ~700 |
| 2.0.0   | 8+        | Full feature set | ~1000+ |

---

## 🐛 Bug Fixes

### Version 1.1.0
- Fixed mode selection navigation
- Fixed ESC key behavior in different screens
- Fixed high score tracking for each mode
- Fixed level progression score persistence

### Version 1.0.0
- Initial stable release
- No bugs from web version port

---

## 🙏 Credits

**Original Web Version:**
- Framework: Phaser 3.70.0
- Deployment: GitHub Pages
- Repository: mckenzieaaa/Prize-Claw

**Python Version:**
- Framework: Pygame 2.6.1
- Language: Python 3.8+
- Development: 2025

---

## 📝 Notes

### Breaking Changes
- None (version 1.x maintains backward compatibility)

### Deprecations
- None

### Known Issues
- High scores are not persisted to disk (in-memory only)
- No mobile/touch support
- VS Mode not yet implemented
- No sound effects

### Performance
- Runs at stable 60 FPS on modern hardware
- Memory usage: ~50MB
- CPU usage: <5% on modern processors

---

For more information, see:
- [README.md](README.md) - Installation and basic usage
- [GAMEPLAY.md](GAMEPLAY.md) - Detailed gameplay guide
- [SCREENSHOTS.md](SCREENSHOTS.md) - Visual interface documentation
