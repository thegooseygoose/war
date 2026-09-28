# War: The Long March

A roguelike built on the card game War. Fight nine battles to reach the King with one life. Both sides flip a card and the higher card hits for the difference in rank. Ties start a war: three cards down, one up, and the winner hits 3 harder per war. Win battles to grow your deck and collect relics.

Originally made as a phone web app, then ported to PC as a standalone Windows app.

## Features

- Opening pack at the start of every run: 18 random cards, with a 1 in 5 chance of a rare face card or Ace
- 3 save slots, with Continue, New Run and Load Run from the main menu
- Widescreen layout that scales to any window size, plus fullscreen
- Synthesized music (menu, battle and boss tracks) and sound effects
- Options: volume, table colour, animation speed, screen shake, particles, key hints
- Custom card art: cards in `sprites/cards/` replace the built-in drawn cards

## Running it

The game is a single `index.html`. The PC app wraps it in a native window with [pywebview](https://pywebview.flowrl.com/).

```bash
pip install pywebview
python launcher.py
```

### Building the .exe

```bash
pip install pyinstaller
python -m PyInstaller --noconfirm --onefile --windowed --distpath dist_v2 --name "War The Long March" --add-data "index.html;." --add-data "fonts;fonts" --add-data "sprites\cards;sprites\cards" launcher.py
```

## Controls

| Key | Action |
| --- | --- |
| Space / F | Flip |
| B | Burn the next card |
| D | View deck |
| 1 2 3 | Pick a reward |
| S | Skip reward |
| Esc | Options |
| F11 | Fullscreen |
| M | Mute |

## Card art

- `sprites/cards/` holds one PNG per card (for example `ace_of_spades.png`, `10_of_hearts.png`, `card_back.png`).
- Cards listed in `MY_CARDS` in `index.html` use their PNG in game. All other cards are drawn by the game.
- Open `sprites/Card Viewer.html` in a browser to compare all the cards side by side.
- `sprites/cards_hires_backup/` holds 500 × 700 renders of the game's original drawn cards.
