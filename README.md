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

## Contributing

Found a wrong gain value, a missing Master, or a bug? Open an issue or send a pull
request. Please keep CSV files at exactly 99 rows with six numeric values per row,
and use the character's key from [`js/chars.js`](js/chars.js) as the `data-char`
value in [`index.html`](index.html).

---

*Breath of Fire III is a trademark of CAPCOM. This is an unofficial fan tool and is
not affiliated with or endorsed by CAPCOM.*
