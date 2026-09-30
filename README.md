# War: The Long March

A roguelike built on the card game War. March through three acts to reach the King with one life. Both sides flip a card and the higher card hits for the difference in rank. Ties start a war: three cards down, one up. The winner hits 3 harder per war and takes the loser's best card for good.

Originally made as a phone web app, then ported to PC as a standalone Windows app.

## Features

- The PC and phone versions share the same rules (the game logic in `index.html` matches `phone/index.html`)
- Three acts (The Border, The Wilds, The Capital), each a new 10-row map plus a boss: the Gatekeeper, the Thornwitch and the King
- Every row is a choice of spots: new cards (Recruits, Suit Drafts, Blind Draws, Trials), stops along the road (Campfire, Backpack, Bone Altar, Woodcarver totems, Mycologists, Mimic, Charm Stones, Store, Mystery events, Chests), then battles and elites
- Tonics to drink mid-battle (Healing, Fire, Luck, Iron), relics, card charms (Gilded, Keen, Mending, Steady) and suit totems
- Wars with real stakes: win one and you capture their best card; lose one and they take yours until you win the battle
- Opening pack at the start of every run: 18 random cards, with a 1 in 5 chance of a rare face card or Ace
- Hover any relic, charm, tonic or totem to see what it does
- 3 save slots, with Continue, New Run and Saved Runs from the main menu (saves from the first PC version carry on in the same act)
- Widescreen layout that scales to any window size, plus fullscreen
- Synthesized music (menu, battle, boss and store tracks) and sound effects
- Options: volume, table colour, animation speed, screen shake, particles, key hints
- Custom card art: cards in `sprites/cards/` replace the built-in drawn cards, in both versions

## Phone version

The phone web app lives in `phone/index.html`, a single page with no build step that saves to the browser's local storage. It loads the card art from `sprites/cards/` (from `../sprites/cards/` when opened from this repo). The live copy is a claude.ai artifact with the art published beside it.

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
| 1 2 3 / arrows | Pick a spot on the map, or a reward |
| 1 – 4 | Drink a tonic (in battle) or pick a choice (at a stop) |
| Enter | Go to the selected spot |
| 1 – 8 | Buy in the store |
| S | Skip reward |
| Esc | Options |
| F11 | Fullscreen |
| M | Mute |

## Card art

- `sprites/cards/` holds one PNG per card (for example `ace_of_spades.png`, `10_of_hearts.png`, `card_back.png`).
- Cards listed in `MY_CARDS` in `index.html` use their PNG in game. All other cards are drawn by the game.
- Open `sprites/Card Viewer.html` in a browser to compare all the cards side by side.
- `sprites/cards_hires_backup/` holds 500 × 700 renders of the game's original drawn cards.
