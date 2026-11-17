# bof3-planner

[![Live site](https://img.shields.io/badge/live-dmoreira--git.github.io%2Fbof3--planner-2563eb)](https://dmoreira-git.github.io/bof3-planner/)

**A stat planner for [Breath of Fire III](https://en.wikipedia.org/wiki/Breath_of_Fire_III).**
Pick a character, split their 99 levels across different Masters, and see the
resulting HP / AP / PWR / DEF / AGL / INT totals.

👉 **https://dmoreira-git.github.io/bof3-planner/**

No install, no build step, no dependency on a server — it all runs in the browser.

## Features

- **Six characters** — Ryu, Nina, Momo, Rei, Garr and Peco, each with the correct
  starting level.
- **Per-level Master assignment** — add rows to give blocks of levels to a Master,
  and watch the totals update live as you type.
- **All 17 Masters** — the full Master roster with its stat modifiers in
  [`masters.json`](masters.json).
- **Accurate base gains** — totals are accumulated level by level from the
  per-character gain tables, so you can compare builds instead of guessing.
- **Instant feedback** — the stat card re-renders on every change, with the
  character portrait and final level included.

## How to use it

1. Pick a character from the tabs at the top.
2. A row appears for the levels **after** the character's starting level. Set how
   many levels that block should span and choose a Master for it.
3. Press **Add Master** to start another block — the planner keeps the total at
   99 levels or fewer, clamping each row's maximum as needed.
4. Read the totals on the results card. Change anything and it recalculates
   immediately.

### How the numbers are calculated

For every level from the character's starting level up to the final level:

| Contribution | Rule |
| --- | --- |
| Base gain | The character's gain row for that level (from their `.csv`). |
| Master modifier | The Master assigned to that level is added to the base gain. |
| Floor at zero | Each stat is clamped with `max(0, base + modifier)`, so a penalty can never subtract from the running total. |

The **first level** (the character's starting level) never receives a Master
modifier. Rows are laid out consecutively from there, so with a starting level of
5 and a first row of 10 levels, those 10 levels cover levels 6–15.

## Data files

The site is driven entirely by flat data files — edit them and reload the page.

### `masters.json`

```json
{
  "masters": [
    { "id": "Mygas", "name": "Mygas", "HP": 0, "AP": 1, "PWR": -1, "DEF": -1, "AGL": 0, "INT": 2 }
  ]
}
```

Each Master is a set of **per-level** modifiers applied to every level it covers.
Values are integers and may be negative.

### Character gain tables (`ryu.csv`, `nina.csv`, …)

One row per level, six comma-separated values in the order **HP, AP, PWR, DEF,
AGL, INT**:

```csv
20,11,12,10,8,10
2,0,1,0,1,1
3,1,1,1,1,2
```

- Row 1 is level 1 — it does **not** include equipment, so it is the character's
  starting stats.
- Each file must contain exactly **99 rows**; the loader rejects anything else.

## Running locally

The planner loads its data with `fetch()`, so it must be served over HTTP rather
than opened from disk as `file://`.

```bash
# Windows
testserver.bat

# any OS with Python 3
python -m http.server
```

Then open <http://localhost:8000>. Any static file server works.

## Deployment

The site is served with **GitHub Pages** straight from this repository's default
branch — no build step, no artifact. Push a change and it goes live at:

**<https://dmoreira-git.github.io/bof3-planner/>**

## Project layout

```
bof3-planner/
├── index.html          # Page shell and styling
├── js/
│   ├── chars.js        # Character roster (names, csv paths, starting levels, portraits)
│   ├── loader.js       # Fetches masters.json and the per-character gain tables
│   ├── levels.js       # Level validation helpers
│   └── ui.js           # Level/Master rows and the stat calculation
├── masters.json        # Master stat modifiers
├── <character>.csv     # Per-level gain tables (ryu.csv, nina.csv, …)
├── imgs/               # Character portraits
└── testserver.bat      # One-line local dev server (python -m http.server)
```

## Adding a character

1. Add a `99`-line CSV with the six stats per level.
2. Drop a portrait into [`imgs/`](imgs).
3. Register the character in [`js/chars.js`](js/chars.js):

   ```js
   Ryu: { name: 'Ryu', csv: 'ryu.csv', minLevel: 1, img: 'imgs/ryu.png' },
   ```

4. Add a tab for it in [`index.html`](index.html) (`data-char` must match the
   key in `chars.js`).

## Adding a Master

Append an entry to the `masters` array in [`masters.json`](masters.json) with a
unique `id`, a display `name`, and an integer modifier for each of the six stats.

## Contributing

Found a wrong gain value, a missing Master, or a bug? Open an issue or send a pull
request. Please keep CSV files at exactly 99 rows with six numeric values per row,
and use the character's key from [`js/chars.js`](js/chars.js) as the `data-char`
value in [`index.html`](index.html).

---

*Breath of Fire III is a trademark of CAPCOM. This is an unofficial fan tool and is
not affiliated with or endorsed by CAPCOM.*
