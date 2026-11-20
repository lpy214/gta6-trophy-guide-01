# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/lpy214/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/lpy214/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: a checklist saved in the browser (localStorage) with export and import, filters by kind, a spoiler setting that hides story trophies until earned, a roadmap to the platinum, the missable trophies flagged, and a guide to each trophy in the ledger's own words that cites its sources.

The trophy names, descriptions and grades are as PlayStation publishes them (as listed by Exophase and PSNProfiles, agreeing on every name, description and grade). The guides draw on PowerPyx's GTA 6 Trophy Guide & Roadmap, GTA Zone and Push Square, and name their sources beside each trophy — never copying their text. The look is original: no Rockstar logo or official artwork.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. It works with the network off: every file it loads is under `app/`.

## Files

- `app/index.html` — the guide
- `app/style.css` — the Vice-dusk look
- `app/js/` — `main.js` (boot, routing), `views.js` (checklist, detail, roadmap, missables, sources), `data.js` (loading and lookups), `store.js` (saved progress, export/import)
- `app/data/trophies.json` — the 55 trophies with their official names, descriptions, grades, hidden flags, kinds, targets, roadmap stages, guides and sources
- `screenshots/` — real renders of the guide in a browser
- `main.ts` — the make.fun entry program (Node 22): copies `app/` and `screenshots/` to `/output` and writes `dossier.json`

## Enter it

Built for make.fun's “Build the best GTA 6 trophy guide” bounty ($250, top 50 share it).

---

<sub>Entered on [make.fun](https://make.fun/?ref=g0cnq9c3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
