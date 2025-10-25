# Developer Guide - Tetris Claw Python Version

## 🔧 Development Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)
- Git (for version control)

### Installation
```bash
# Clone the repository
git clone https://github.com/mckenzieaaa/Prize-Claw.git
cd Prize-Claw/python_tetris_claw

# Install dependencies
pip3 install -r requirements.txt

# Run the game
python3 main.py
```

---

## 📐 Code Architecture

### Main Components

#### 1. Game Class
**Purpose**: Main game controller and loop manager

**Key Responsibilities**:
- Game loop (60 FPS)
- State management
- Event handling
- Rendering coordination
- Mode transitions

**Important Methods**:
```python
__init__()           # Initialize game
run()                # Main game loop
update(dt)           # Update game state
draw_menu()          # Render main menu
draw_mode_select()   # Render mode selection
draw_game()          # Render gameplay
draw_game_over()     # Render game over screen
draw_level_complete()# Render level complete screen
handle_input()       # Process keyboard input
reset_game(mode)     # Reset for new game
next_level()         # Progress to next level
```

**State Variables**:
```python
self.mode            # Current GameMode
self.score           # Current score
self.high_scores     # Dictionary of high scores
self.tetrominoes     # List of active Tetromino objects
self.grid            # 2D grid for collision detection
self.claw            # Claw object
self.grabbed_piece   # Currently grabbed Tetromino (or None)
```

---

#### 2. Claw Class
**Purpose**: Manage claw movement and state

**Key Responsibilities**:
- Position tracking
- Smooth movement with multi-threshold
- State management (idle, moving, grabbing, delivering)
- Rendering claw graphics

**Important Methods**:
```python
__init__(x, y)       # Initialize claw position
move_to(x, y)        # Set target position
update()             # Update position (returns True if arrived)
draw(screen)         # Render claw
```

**Movement Logic**:
```python
distance = sqrt((target_x - x)² + (target_y - y)²)

if distance > speed:
    # Normal speed movement
    move at full speed
elif distance > 0.5:
    # Slow approach
    move at 20% speed
else:
    # Arrived at target
    snap to target
```

---

#### 3. Tetromino Dataclass
**Purpose**: Store tetromino block data

**Fields**:
```python
x: float                    # Center X position
y: float                    # Center Y position
shape_key: str              # Shape type (I, O, T, S, Z, J, L)
blocks: List[Tuple[int, int]]  # Block positions relative to center
color: Tuple[int, int, int]    # RGB color
grid_positions: List[Tuple[int, int]]  # Grid coordinates
```

---

#### 4. GameMode Enum
**Purpose**: Define game states

**Values**:
```python
MENU           # Main menu
MODE_SELECT    # Mode selection screen
ENDLESS        # Endless mode gameplay
TIME_ATTACK    # Time attack mode gameplay
LEVELS         # Levels mode gameplay
PAUSE          # Paused (not yet implemented)
GAME_OVER      # Game over screen
LEVEL_COMPLETE # Level complete screen
```

---

## 🎮 Game Flow

### State Transition Diagram
```
START
  ↓
MENU (Press SPACE)
  ↓
MODE_SELECT (Select with W/S, confirm with SPACE)
  ↓
  ├─→ ENDLESS ←──────┐
  │     ↓ (ESC)      │
  │   MODE_SELECT    │
  │                  │
  ├─→ TIME_ATTACK ───┤
  │     ↓ (Time up)  │
  │   GAME_OVER ─────┤
  │     ↓ (SPACE)    │
  │   MODE_SELECT    │
  │                  │
  └─→ LEVELS ────────┘
        ↓ (Goal reached)
      LEVEL_COMPLETE
        ↓ (SPACE)
      Next LEVEL or GAME_OVER
```

---

## 🔍 Key Systems Explained

### 1. Spawning System
```python
def spawn_tetromino(self):
    # 1. Choose random shape
    shape_key = random.choice(list(SHAPES.keys()))
    
    # 2. Random column (0-7)
    start_col = random.randint(0, GRID_WIDTH - 4)
    
    # 3. Find lowest empty row
    spawn_row = GRID_HEIGHT - 1
    for col in range(start_col, min(start_col + 4, GRID_WIDTH)):
        for row in range(GRID_HEIGHT - 1, -1, -1):
            if self.grid[row][col] is not None:
                spawn_row = min(spawn_row, row - 1)
                break
    
    # 4. Calculate center position
    # 5. Create Tetromino object
    # 6. Occupy grid cells
    # 7. Add to tetrominoes list
```

**Bottom-up Spawning Logic**:
- Scans grid from bottom to top
- Finds lowest empty row
- Places blocks immediately
- Pushes existing blocks upward

---

### 2. Grabbing System
```python
def grab_piece(self):
    # 1. Check if already holding a piece
    if self.grabbed_piece:
        return
    
    # 2. For each tetromino:
    for tetromino in self.tetrominoes:
        # 3. Calculate bounding box
        min_x, max_x, min_y, max_y = calculate_bounds(tetromino)
        
        # 4. Check if claw is within expanded area (±20px)
        if (min_x - 20 <= claw.x <= max_x + 20 and 
            min_y - 20 <= claw.y <= max_y + 20):
            
            # 5. Grab the piece
            self.grabbed_piece = tetromino
            
            # 6. Set claw to auto-delivery mode
            claw.state = 'moving_to_exit'
            claw.auto_moving = True
            claw.move_to(exit_box.centerx, exit_box.top - 60)
            
            # 7. Clear grid cells
            clear_grid_positions(tetromino)
            
            break
```

**Expanded Grab Area**:
- Original bounds ± 20 pixels
- Makes grabbing more forgiving
- Matches web version behavior

---

### 3. Delivery System
```python
def deliver_piece(self):
    # 1. Remove from active tetrominoes
    self.tetrominoes.remove(self.grabbed_piece)
    
    # 2. Clear grabbed reference
    self.grabbed_piece = None
    
    # 3. Add score
    self.score += 100
    
    # 4. Mode-specific logic
    if self.mode == GameMode.LEVELS:
        self.pieces_collected += 1
        if self.pieces_collected >= self.level_goal:
            # Level complete!
            
    # 5. Reset claw state
    claw.auto_moving = False
    claw.state = 'idle'
    claw.target_x = claw.x  # Prevent shaking
    claw.target_y = claw.y
```

**Target Reset Trick**:
- Setting target to current position prevents oscillation
- Critical for smooth delivery without shaking

---

### 4. Rendering Pipeline
```python
def run(self):
    while self.running:
        # 1. Limit frame rate
        dt = self.clock.tick(FPS)
        
        # 2. Handle events
        handle_events()
        
        # 3. Process continuous input
        handle_input()
        
        # 4. Update game state
        update(dt)
        
        # 5. Render current mode
        if mode == MENU:
            draw_menu()
        elif mode == MODE_SELECT:
            draw_mode_select()
        # ... etc
        
        # 6. Flip display buffer
        pygame.display.flip()
```

---

## 🎨 Rendering Details

### Drawing a Tetromino
```python
def draw_tetromino(self, tetromino):
    for bx, by in tetromino.blocks:
        # 1. Calculate center offset
        center_x = sum(b[0] for b in blocks) / len(blocks)
        center_y = sum(b[1] for b in blocks) / len(blocks)
        
        # 2. Calculate screen position
        x = tetromino.x + (bx - center_x) * BLOCK_SIZE
        y = tetromino.y - (by - center_y) * BLOCK_SIZE
        
        # 3. Draw block body
        rect = pygame.Rect(x - BLOCK_SIZE/2 + 2, 
                          y - BLOCK_SIZE/2 + 2, 
                          BLOCK_SIZE - 4, 
                          BLOCK_SIZE - 4)
        pygame.draw.rect(screen, color, rect, border_radius=8)
        
        # 4. Draw highlight
        highlight = pygame.Rect(...)
        pygame.draw.rect(screen, (255,255,255,128), highlight)
        
        # 5. Draw border
        pygame.draw.rect(screen, WHITE, rect, 2, border_radius=8)
```

---

## 🔢 Constants Reference

### Screen & Grid
```python
SCREEN_WIDTH = 700    # Total window width
SCREEN_HEIGHT = 800   # Total window height
BLOCK_SIZE = 40       # Size of each grid block
GRID_WIDTH = 8        # Number of columns
GRID_HEIGHT = 14      # Number of rows
FPS = 60              # Target frame rate
```

### Timing
```python
spawn_interval = 2000    # Milliseconds between spawns
time_remaining = 60000   # Time Attack duration (60s)
```

### Difficulty Scaling (Levels Mode)
```python
level_goal = 5 + (current_level - 1) * 2

# Level 1: 5 pieces
# Level 2: 7 pieces
# Level 3: 9 pieces
# ...
# Level 10: 23 pieces
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Claw Shaking at Delivery
**Problem**: Claw oscillates around target position

**Solution**:
```python
# After delivery, reset target to current position
self.claw.target_x = self.claw.x
self.claw.target_y = self.claw.y
```

### Issue 2: Blocks Spawning Off-Grid
**Problem**: Some blocks appear outside visible area

**Solution**:
```python
# Clamp spawn column
start_col = random.randint(0, GRID_WIDTH - 4)  # Not GRID_WIDTH!
```

### Issue 3: Grabbed Piece Not Following Claw
**Problem**: Piece doesn't update position when grabbed

**Solution**:
```python
# In draw_game(), before drawing grabbed piece:
if self.grabbed_piece:
    self.grabbed_piece.x = self.claw.x
    self.grabbed_piece.y = self.claw.y + 40  # Offset below claw
```

### Issue 4: Grid Collision Bugs
**Problem**: Multiple pieces occupy same grid cell

**Solution**:
```python
# Always clear grid when grabbing:
for gx, gy in tetromino.grid_positions:
    if 0 <= gy < GRID_HEIGHT and 0 <= gx < GRID_WIDTH:
        self.grid[gy][gx] = None
```

---

## 🚀 Adding New Features

### Adding a New Game Mode

1. **Add to GameMode enum**:
```python
class GameMode(Enum):
    # ... existing modes
    MY_NEW_MODE = "my_new_mode"
```

2. **Add initialization in reset_game()**:
```python
def reset_game(self, mode):
    # ... existing code
    if mode == GameMode.MY_NEW_MODE:
        # Initialize mode-specific variables
        self.my_variable = initial_value
```

3. **Add update logic**:
```python
def update(self, dt):
    if self.mode == GameMode.MY_NEW_MODE:
        # Update mode-specific logic
        pass
```

4. **Add drawing function**:
```python
def draw_my_new_mode(self):
    # Draw mode-specific UI
    pass
```

5. **Add to main loop**:
```python
def run(self):
    # ... in rendering section
    elif self.mode == GameMode.MY_NEW_MODE:
        self.draw_my_new_mode()
```

---

### Adding Sound Effects

1. **Install pygame mixer** (already included in pygame)

2. **Load sounds in __init__()**:
```python
pygame.mixer.init()
self.sound_grab = pygame.mixer.Sound('sounds/grab.wav')
self.sound_deliver = pygame.mixer.Sound('sounds/deliver.wav')
```

3. **Play sounds on events**:
```python
def grab_piece(self):
    # ... existing code
    self.sound_grab.play()

def deliver_piece(self):
    # ... existing code
    self.sound_deliver.play()
```

---

### Saving High Scores to File

```python
import json

def save_high_scores(self):
    with open('high_scores.json', 'w') as f:
        json.dump(self.high_scores, f)

def load_high_scores(self):
    try:
        with open('high_scores.json', 'r') as f:
            self.high_scores = json.load(f)
    except FileNotFoundError:
        # Use defaults
        self.high_scores = {
            'endless': 0,
            'time_attack': 0,
            'levels': [0] * 10
        }

# Call in __init__() and when updating high scores
```

---

## 📊 Performance Optimization

### Current Performance
- **60 FPS** constant
- **~50MB** memory usage
- **<5%** CPU usage

### Optimization Tips

1. **Reduce Draw Calls**:
```python
# Cache static elements (grid lines)
if not hasattr(self, 'grid_surface'):
    self.grid_surface = self.create_grid_surface()
    
screen.blit(self.grid_surface, (0, 0))
```

2. **Object Pooling**:
```python
# Reuse Tetromino objects instead of creating new ones
class TetrominoPool:
    def __init__(self, size):
        self.pool = [Tetromino(...) for _ in range(size)]
        self.available = self.pool.copy()
    
    def get(self):
        return self.available.pop() if self.available else None
    
    def release(self, obj):
        self.available.append(obj)
```

3. **Limit Updates**:
```python
# Only update visible tetrominoes
for tetromino in self.tetrominoes:
    if is_visible(tetromino):
        update_tetromino(tetromino)
```

---

## 🧪 Testing

### Manual Testing Checklist

**Main Menu**:
- [ ] Title displays correctly
- [ ] SPACE starts game
- [ ] ESC quits game

**Mode Selection**:
- [ ] All 3 modes visible
- [ ] W/S navigation works
- [ ] SPACE confirms selection
- [ ] High scores display correctly
- [ ] ESC returns to main menu

**Endless Mode**:
- [ ] Blocks spawn continuously
- [ ] WASD moves claw
- [ ] SPACE grabs pieces
- [ ] Auto-delivery works
- [ ] Score increases
- [ ] ESC returns to mode select

**Time Attack**:
- [ ] Timer counts down
- [ ] Timer color changes (white→yellow→red)
- [ ] Game ends at 0
- [ ] High score saves

**Levels Mode**:
- [ ] Level number displays
- [ ] Progress updates (X/Y)
- [ ] Level complete screen shows
- [ ] Score persists across levels
- [ ] All 10 levels completable

---

## 📝 Code Style Guide

### Naming Conventions
- **Classes**: PascalCase (`Game`, `Claw`)
- **Functions**: snake_case (`spawn_tetromino`, `draw_game`)
- **Constants**: UPPER_CASE (`SCREEN_WIDTH`, `FPS`)
- **Variables**: snake_case (`high_scores`, `grabbed_piece`)

### Comments
```python
# Single-line comment for simple explanations

def complex_function():
    """
    Multi-line docstring for functions.
    
    Explains purpose, parameters, and return value.
    """
    pass
```

### Formatting
- **Indentation**: 4 spaces
- **Line length**: ~100 characters max
- **Blank lines**: 2 between functions, 1 between logical blocks

---

## 🔐 Security Notes

**No security concerns** for this standalone game:
- No network communication
- No file system writes (except future high score saving)
- No user data collection
- No external dependencies beyond Pygame

---

## 📚 Further Reading

- [Pygame Documentation](https://www.pygame.org/docs/)
- [Python Official Docs](https://docs.python.org/3/)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Tetris Wiki](https://tetris.wiki/)

---

## 🤝 Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Review Checklist
- [ ] Code follows style guide
- [ ] No syntax errors
- [ ] Functions are documented
- [ ] Game runs at 60 FPS
- [ ] No memory leaks
- [ ] All modes tested

---

**Happy Coding!** 🎮💻
