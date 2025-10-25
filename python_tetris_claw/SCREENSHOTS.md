# Tetris Claw - Python Version Screenshots

## 📸 Game Screens Overview

### 1. Main Menu
```
┌──────────────────────────────────┐
│                                  │
│                                  │
│         TETRIS CLAW              │
│                                  │
│                                  │
│    PRESS SPACE TO START          │
│                                  │
│                                  │
│       Press ESC to quit          │
│                                  │
└──────────────────────────────────┘
```
**Features:**
- Clean, minimalist design
- Clear call-to-action
- Easy navigation

---

### 2. Mode Selection Screen
```
┌──────────────────────────────────┐
│        SELECT MODE                │
│                                  │
│  ┌──────────────────────────┐   │
│  │   ▶ ENDLESS              │   │ ← Selected
│  │      Best: 1200          │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │     TIME ATTACK          │   │
│  │      Best: 800           │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │     LEVELS               │   │
│  │      Best: 1500          │   │
│  └──────────────────────────┘   │
│                                  │
│  W/S: Select | SPACE: Confirm   │
└──────────────────────────────────┘
```
**Features:**
- Three game mode options
- High score display for each mode
- Visual selection highlight
- Keyboard navigation

---

### 3. Gameplay Screen (All Modes)
```
┌──────────────────────────────────┐
│ SCORE: 500        TIME: 45s      │ ← HUD (varies by mode)
│ LEVEL 3           Progress: 3/9  │
│                                  │
│ ┌────────────────┐         ┌──┐ │
│ │ ║              │         │  │ │
│ │ ║     ▓▓       │         │  │ │
│ │ ║     ▓▓  ▓    │         │  │ │
│ │ ║    ▓▓▓▓▓     │         │▓ │ │
│ │ ║              │         │▓▓│ │
│ │ ║    ▓  ▓      │         └──┘ │
│ │ ║    ▓▓▓▓      │         EXIT  │
│ │ ║    ▓  ▓▓     │               │
│ │ ║  ▓▓▓         │               │
│ │ ║  ▓ ▓▓        │               │
│ │ ╫══════════════│ ← Danger Line │
│ │ ║              │               │
│ └────────────────┘               │
│                                  │
│  WASD: Move | SPACE: Grab        │
└──────────────────────────────────┘
```

**Elements:**
- **Grid Area (Left):** 8×14 block playing field
- **Danger Line (Pink):** Warning indicator at top
- **Claw (║):** Controllable grabber with rope
- **Tetromino Blocks (▓):** Various colored shapes
- **EXIT Zone (Right):** Green delivery box
- **HUD (Top):** Score, time, or level info
- **Instructions (Bottom):** Control hints

---

### 4. Endless Mode
```
HUD Display:
┌──────────────────────┐
│ SCORE: 1200          │
│                      │
└──────────────────────┘

Features:
- Simple score tracking
- No time pressure
- Progressive difficulty
- Continuous spawning
```

---

### 5. Time Attack Mode
```
HUD Display:
┌──────────────────────┐
│ SCORE: 800           │
│ TIME: 15s    ← RED   │ (Color changes based on time)
└──────────────────────┘

Timer Colors:
- WHITE:  > 20 seconds remaining
- YELLOW: 10-20 seconds remaining  
- RED:    < 10 seconds remaining

Features:
- 60-second countdown
- Fast-paced gameplay
- High score tracking
- Visual urgency feedback
```

---

### 6. Levels Mode
```
HUD Display:
┌──────────────────────┐
│ SCORE: 1500          │
│ LEVEL 5              │
│ Progress: 8/13       │
└──────────────────────┘

Features:
- Level number display
- Progress counter (collected/goal)
- Goal increases per level
- Level completion screens
```

---

### 7. Level Complete Screen
```
┌──────────────────────────────────┐
│                                  │
│                                  │
│      LEVEL COMPLETE!             │
│                                  │
│    Level 3 Cleared               │
│                                  │
│       Score: 900                 │
│                                  │
│                                  │
│  Press SPACE for next level      │
│                                  │
└──────────────────────────────────┘
```
**Features:**
- Success feedback
- Current score display
- Clear progression indication
- Continue prompt

---

### 8. Game Over Screen
```
┌──────────────────────────────────┐
│                                  │
│                                  │
│       GAME OVER                  │
│                                  │
│     Final Score: 1200            │
│                                  │
│     NEW HIGH SCORE!              │ ← If applicable
│        or                        │
│     High Score: 1500             │
│                                  │
│   Press SPACE to continue        │
│                                  │
└──────────────────────────────────┘
```
**Features:**
- Final score display
- High score comparison
- New record celebration
- Return to mode select

---

## 🎨 Visual Design Elements

### Color Palette

**UI Colors:**
- Background: Dark Blue-Black (10, 10, 15)
- Text: White (255, 255, 255)
- Accent: Blue (94, 114, 228)
- Secondary: Gray (200, 200, 200)
- Grid: Dark Gray (50, 50, 60)

**Tetromino Colors:**
- I-Block: Cyan (0, 240, 240)
- O-Block: Yellow (240, 240, 0)
- T-Block: Purple (160, 0, 240)
- S-Block: Green (0, 240, 0)
- Z-Block: Red (240, 0, 0)
- J-Block: Blue (94, 114, 228)
- L-Block: Orange (240, 160, 0)

**Special Colors:**
- EXIT Zone: Green (50, 200, 50)
- Danger Line: Pink (255, 51, 102)
- Time Warning: Yellow → Red
- Success: Green
- Error: Red

### Typography
- **Large Font (64px):** Titles
- **Medium Font (32px):** Scores, mode names
- **Small Font (24px):** Instructions, labels

### Layout Principles
- **Left Alignment:** Game grid and score
- **Center Alignment:** Menus and messages
- **Right Alignment:** EXIT zone
- **Top:** HUD information
- **Bottom:** Instructions and controls

---

## 📐 Screen Layout Specifications

### Game Grid
- **Position:** Left side of screen
- **Size:** 320×560 pixels (8×14 blocks)
- **Block Size:** 40×40 pixels
- **Border:** Visible grid lines

### Claw
- **Starting Position:** Top-right area
- **Rope:** Thin gray line from top
- **Body:** Light gray rectangle (50×35px)
- **Arms:** Triangular polygon shapes

### EXIT Zone
- **Position:** Bottom-right corner
- **Size:** 100×60 pixels
- **Color:** Semi-transparent green
- **Border:** Solid green outline
- **Label:** "EXIT" text centered

### HUD Elements
- **Score:** Top-left (30, 30)
- **Time/Level:** Below score (30, 70)
- **Progress:** Below level (30, 110)

---

## 🖼️ Gameplay Flow Diagram

```
┌─────────┐
│  START  │
└────┬────┘
     │
     v
┌─────────────┐
│ Main Menu   │
└─────┬───────┘
      │ SPACE
      v
┌──────────────┐
│ Mode Select  │
└──┬───────────┘
   │ SPACE (Select Mode)
   │
   ├──→ Endless Mode
   │    ├─→ Play Game
   │    └─→ ESC → Mode Select
   │
   ├──→ Time Attack
   │    ├─→ Play Game (60s)
   │    └─→ Time Up → Game Over → Mode Select
   │
   └──→ Levels Mode
        ├─→ Level 1
        ├─→ Level Complete → Level 2
        ├─→ ... (Continue through levels)
        ├─→ Level 10 Complete → Game Over
        └─→ ESC → Mode Select
```

---

## 🎯 Interaction States

### Button States
1. **Normal:** Gray background, gray text
2. **Hover/Selected:** Blue background, white text  
3. **Pressed:** Darker blue background

### Claw States
1. **Idle:** Stationary, accepting input
2. **Moving:** Smooth movement toward target
3. **Grabbing:** SPACE pressed, checking collision
4. **Delivering:** Auto-moving to EXIT with piece
5. **Releasing:** Dropping piece at EXIT

### Game States
1. **Menu:** Main menu screen
2. **ModeSelect:** Choose game mode
3. **Playing:** Active gameplay
4. **Paused:** (Not yet implemented)
5. **GameOver:** End screen with score
6. **LevelComplete:** Between-level transition

---

This visual guide should help you understand the complete user interface and gameplay flow of Tetris Claw!
