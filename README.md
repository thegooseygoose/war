# War: The Long March

A roguelike built on the card game War. March through three acts to reach the King with one life. Both sides flip a card and the higher card hits for the difference in rank. Ties start a war: three cards down, one up. The winner hits 3 harder per war and takes the loser's best card for good.

Originally made as a phone web app, then ported to PC as a standalone Windows app.

## Features

- Branching map, new every run: pick your route through battle spots and store spots across three acts (The Border, The Wilds, The Capital), each ending in a boss with a gimmick
- Every battle shows its prize on the map (gold, a card, a charm, or a relic from bosses)
- Stores between battles: relics, cards, charms, healing and deck upgrades for gold
- Card charms: Gilded (+1 gold when the card wins), Keen (+2 damage) and Mending (heal 1)
- Wars with real stakes: the winner captures the loser's best card from the pile
- Opening pack at the start of every run: 18 random cards, with a 1 in 5 chance of a rare face card or Ace
- Hover any relic or charm to see what it does
- 3 save slots, with Continue, New Run and Saved Runs from the main menu
- Widescreen layout that scales to any window size, plus fullscreen
- Synthesized music (menu, battle, boss and store tracks) and sound effects
- Options: volume, table colour, animation speed, screen shake, particles, key hints
- Custom card art: cards in `sprites/cards/` replace the built-in drawn cards

## Phone version

The phone web app lives in `phone/index.html`, a single self-contained page. Open it in any mobile browser. It has no build step and saves to the browser's local storage.

## Running it

The PC game is a single `index.html`. The PC app wraps it in a native window with [pywebview](https://pywebview.flowrl.com/).

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
| 1 2 3 / arrows | Pick a path on the map, or a reward |
| Enter | Go to the selected spot |
| 1 – 6 | Buy in the store |
| S | Skip reward |
| Esc | Options |
| F11 | Fullscreen |
| M | Mute |

## Card art

- `sprites/cards/` holds one PNG per card (for example `ace_of_spades.png`, `10_of_hearts.png`, `card_back.png`).
- Cards listed in `MY_CARDS` in `index.html` use their PNG in game. All other cards are drawn by the game.
- Open `sprites/Card Viewer.html` in a browser to compare all the cards side by side.
- `sprites/cards_hires_backup/` holds 500 × 700 renders of the game's original drawn cards.
