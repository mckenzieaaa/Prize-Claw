# Prize Claw
A Pygame claw machine game

## Python Pygame Claw Machine

Files:
- `python_game/main.py` — Claw machine game with movement, drop, grab mechanics
- `python_game/requirements.txt` — lists `pygame` dependency
- `python_game/prize_templates.py` — drawing helpers for prizes (bunny, teddy, bee, cat)
- `python_game/generate_prizes.py` — generates prize PNGs into `python_game/assets/generated/`

### How to run (on macOS):

1. Create and activate a virtualenv (optional but recommended):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r python_game/requirements.txt
```

3. Generate prize sprites:

```bash
python python_game/generate_prizes.py
```

This creates `prize_bunny.png`, `prize_teddy.png`, `prize_bee.png`, `prize_cat.png` under `python_game/assets/generated/`.

4. Run the game:

```bash
python python_game/main.py
```

### How to play:
- Use **LEFT/RIGHT arrow keys** (or A/D) to move the claw horizontally
- Press **SPACE** to drop the claw and attempt to grab a prize
- The claw will automatically lift and move to the exit chute
- Collect prizes to increase your score!
