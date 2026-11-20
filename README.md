[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/cervus-snoopy/ember-velvet-ridge-q3m8/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/cervus-snoopy/ember-velvet-ridge-q3m8/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# GTA VI Trophy Guide & Tracker

**All 55 Grand Theft Auto VI trophies — an original guide and a cited source for every one — plus a six-stage platinum roadmap, a missable watchlist, and a tracker that saves your progress in the browser.**

Bounty: [make.fun/bounty/gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01)

## What it is

An offline single-page guide for the official PlayStation trophy list (55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze). It is three things in one:

1. **A guide** — every trophy has an original guide written from its official description, with a named source beside it (PlayStation trophy list via Exophase, PSNProfiles, Rockstar Games). A specific location or step with no citation earns no credit, so the guide never states one as fact without a source.
2. **A roadmap** — six stages in order: story playthrough, side missions & strangers, collectibles & exploration, activities & challenges, combat & crime, and economy / 100% / platinum. Each stage shows its own progress bar.
3. **A tracker** — tick trophies as you earn them (saved in `localStorage`, on your device only), filter by grade, kind, or missable-only, search by name or keyword, export your progress to a file and import it back, and switch on spoiler-safe mode to hide story trophy names and descriptions until you earn them.

## The missable watchlist

Only four trophies carry real missable risk, and the guide flags each one on its card and in a dedicated watchlist:

- **Hot Together** and **Retail Therapy** — both need your partner beside you; partner availability is story-gated, so take the chance while the story has you together.
- **Actions Speak Louder** — story choices are finite; take every decision point seriously.
- **The Truth Is Out There** — a one-off strange event that is easy to walk past and hard to find again.

Everything else can be earned any time, including after the story in free roam.

## Honesty note

GTA VI is unreleased. Trophy names, descriptions and grades are the official PlayStation list, reproduced exactly. Where a step is only implied by the description, the guide says so — it does not invent a specific location as fact. Once the game is out, the source matrix points to where community methods will be confirmed (PSNProfiles trophy guide), and the guides can be tightened against them.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network, no account. The app is `app/` — `index.html`, `style.css`, `app.js`, and `app/data/trophies.json`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/dossier.json plus copies of app/ and screenshots/
```

## License

MIT — see [LICENSE](LICENSE). SPDX-License-Identifier: MIT
