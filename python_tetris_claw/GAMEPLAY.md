# Tetris Claw - Gameplay Guide

## 🎮 How to Play

### Starting the Game
1. Run `python3 main.py` from the terminal
2. Press **SPACE** at the main menu to continue
3. Select your preferred game mode using **W/S** keys
4. Press **SPACE** to start playing

### Claw Controls
- **W** - Move claw UP
- **A** - Move claw LEFT  
- **S** - Move claw DOWN
- **D** - Move claw RIGHT
- **SPACE** - Grab piece at current position

### Objective
Position the claw over Tetris pieces and grab them. Once grabbed, the claw automatically delivers the piece to the EXIT zone, earning you points!

## 🎯 Game Modes

### Endless Mode
**Goal:** Get the highest score possible

- Blocks continuously spawn from the bottom
- No time limit - play at your own pace
- Spawn rate gradually increases over time
- Every piece delivered = 100 points
- Perfect for practicing and relaxation

**Tips:**
- Focus on pieces near the EXIT zone first
- Don't let blocks pile up too high
- The danger line at the top indicates overflow risk

---

### Time Attack Mode  
**Goal:** Score as many points as possible in 60 seconds

- 60-second countdown timer
- Timer color changes as time runs low:
  - **WHITE** (>20s remaining) - Plenty of time
  - **YELLOW** (>10s remaining) - Getting urgent  
  - **RED** (≤10s remaining) - Final countdown!
- Game ends when timer reaches 0
- High score automatically saved

**Tips:**
- Move quickly and efficiently
- Prioritize easy-to-grab pieces
- Keep the claw moving - every second counts!
- Don't waste time on difficult pieces

---

### Levels Mode
**Goal:** Complete all 10 levels by reaching piece collection goals

#### Level Progression:
- **Level 1:** Collect 5 pieces
- **Level 2:** Collect 7 pieces
- **Level 3:** Collect 9 pieces
- **Level 4:** Collect 11 pieces
- **Level 5:** Collect 13 pieces
- **Level 6:** Collect 15 pieces
- **Level 7:** Collect 17 pieces
- **Level 8:** Collect 19 pieces
- **Level 9:** Collect 21 pieces
- **Level 10:** Collect 23 pieces

**Features:**
- Each level displays current progress (e.g., "3/5")
- Level complete screen shows between levels
- Score carries over across all levels
- Difficulty increases with each level
- Complete all 10 levels to win the game!

**Tips:**
- Plan your moves carefully
- Focus on reaching the goal efficiently
- Later levels require more pieces but also spawn them faster
- Don't rush - accuracy matters more than speed

---

## 💡 General Tips & Strategies

### Claw Movement
- The claw has **smooth acceleration** - it speeds up and slows down naturally
- Hold direction keys for continuous movement
- Release keys to stop at current position
- The claw automatically slows down when approaching the EXIT zone

### Grabbing Pieces
- Position the claw **above or near** the piece center
- The grab area is slightly expanded (±20px) for easier gameplay
- You can grab from slightly above the piece
- Once grabbed, the piece follows the claw automatically

### Spawning Mechanics
- New pieces spawn from the **bottom** of the screen
- They push existing pieces upward
- Pieces are placed randomly across the grid
- All 7 classic Tetromino shapes appear:
  - **I** (Cyan) - 4 blocks in a line
  - **O** (Yellow) - 2×2 square
  - **T** (Purple) - T-shape
  - **S** (Green) - S-shape
  - **Z** (Red) - Z-shape
  - **J** (Blue) - J-shape
  - **L** (Orange) - L-shape

### Scoring
- Each delivered piece = **100 points**
- Score persists across levels in Levels Mode
- High scores are tracked separately for each mode
- New high scores are highlighted on game over screen

### Screen Elements
- **Grid Lines** - Visual guide for piece positions
- **Danger Line** - Pink line near top (overflow warning)
- **EXIT Zone** - Green box in bottom-right corner
- **Score Display** - Top-left corner
- **Mode-specific Info** - Timer (Time Attack) or Progress (Levels)
- **Instructions** - Bottom of screen

---

## 🏆 Mastering the Game

### Efficiency Tips
1. **Minimize claw travel distance** - Grab nearby pieces first
2. **Create clear paths** - Remove blocking pieces strategically  
3. **Watch the spawn timer** - Anticipate new pieces
4. **Stay calm under pressure** - Panic leads to mistakes

### Advanced Techniques
- **Pre-positioning:** Move toward the next target while delivering
- **Quick grabs:** Tap SPACE precisely when aligned
- **Crowd control:** Prevent pile-ups by clearing dense areas
- **Time management:** In Time Attack, skip difficult pieces

### Common Mistakes to Avoid
- ❌ Grabbing while claw is moving to EXIT (wait for idle state)
- ❌ Letting pieces stack too high
- ❌ Wasting time on pieces in corners
- ❌ Not checking progress in Levels Mode

---

## 🎨 Visual Feedback

### Colors Guide
- **White** - UI text, grid lines
- **Cyan/Yellow/Purple/Green/Red/Blue/Orange** - Tetromino blocks
- **Gray** - Secondary text, claw rope
- **Green** - EXIT zone, success indicators
- **Red** - Time warnings, game over
- **Blue** - Interactive elements, selection

### Animations
- Claw smoothly accelerates and decelerates
- Grabbed pieces follow claw with slight offset
- Timer changes color based on remaining time
- Buttons highlight when selected

---

## 🔧 Technical Info

- **Resolution:** 700×800 pixels
- **Grid:** 8 columns × 14 rows
- **Block Size:** 40×40 pixels
- **Frame Rate:** 60 FPS
- **Spawn Interval:** 2000ms (2 seconds)
- **Claw Speed:** 3.75 pixels per frame (max)

---

## 📝 Quick Reference Card

```
┌─────────────────────────────────────┐
│        TETRIS CLAW CONTROLS         │
├─────────────────────────────────────┤
│  Movement         W/A/S/D            │
│  Grab Piece       SPACE              │
│  Menu Select      W/S + SPACE        │
│  Pause/Menu       ESC                │
│  Quit Game        ESC (at menu)      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           MODE OVERVIEW             │
├─────────────────────────────────────┤
│  Endless        No time limit        │
│  Time Attack    60 second race       │
│  Levels         10 level progression │
└─────────────────────────────────────┘
```

---

Enjoy playing Tetris Claw! 🎮✨
