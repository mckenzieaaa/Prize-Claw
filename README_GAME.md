# 🎮 Claw Machine Game

A fun and addictive claw machine game built with Phaser 3!

## 🕹️ Play Online

**[Play the Game Here!](https://mckenzieaaa.github.io/Farm/)**

## 🎯 How to Play

- **Desktop**: 
  - Use **LEFT/RIGHT arrow keys** or click to position the claw
  - Press **SPACE** or click the **GRAB!** button to drop and grab
  
- **Mobile/Touch**:
  - Tap to move the claw left/right
  - Tap the **GRAB!** button to drop and grab

## 🎨 Features

- ✨ 4 different cute prize types (bunny, teddy, striped doll, cat)
- 🎲 70% grab success rate with random drop chance
- 📱 Responsive design - works on desktop and mobile
- 🏆 Score tracking
- 🎪 Smooth animations and physics

## 🛠️ Local Development

### Web Version (in `docs/`)

Simply open `docs/index.html` in a web browser, or run a local server:

```bash
cd docs
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

### Python Version (in `python_game/`)

Requires Python 3 and pygame:

```bash
# Install dependencies
pip install -r python_game/requirements.txt

# Generate prize images
python python_game/generate_prizes.py

# Run the game
python python_game/main.py
```

## 📁 Project Structure

```
Farm/
├── docs/                  # Web version (GitHub Pages)
│   ├── index.html        # Entry page
│   └── game.js           # Phaser 3 game code
├── python_game/          # Python/Pygame version
│   ├── main.py           # Main game
│   ├── prize_templates.py # Prize drawing functions
│   ├── generate_prizes.py # Generate PNG assets
│   └── requirements.txt   # Python dependencies
└── README.md             # This file
```

## 🚀 Deployment

This game is automatically deployed to GitHub Pages from the `docs/` directory.

To deploy your own version:

1. Fork this repository
2. Go to **Settings** > **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Select branch **main** and folder **/docs**
5. Click **Save**
6. Your game will be live at `https://[your-username].github.io/Farm/`

## 🎨 Customization

To modify the prizes or game mechanics:

- Edit `docs/game.js` for the web version
- Edit `python_game/main.py` and `python_game/prize_templates.py` for the Python version

Adjust difficulty by changing:
- Grab success rate (default: 0.7 = 70%)
- Drop chance during lift (default: 0.001 per frame)
- Claw speed (`speedH`, `speedV`)

## 📝 License

MIT License - feel free to use and modify!

## 👨‍💻 Credits

Created with ❤️ using:
- [Phaser 3](https://phaser.io/) - Game framework
- [Pygame](https://www.pygame.org/) - Python version

---

**Have fun playing! 🎉**
