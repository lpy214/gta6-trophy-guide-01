[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/lpy214/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/lpy214/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA 6, all 55 trophies

An offline guide and tracker for every PlayStation 5 trophy in **Grand Theft Auto VI** (launched 19 November 2026): 55 trophies — 1 platinum, 2 gold, 6 silver, 46 bronze — each with its official name, description and grade, a guide in our own words that cites its sources, and a checklist that saves in your browser.

## What it does

- **Checklist** — tick trophies off as you earn them; progress is saved in the browser (localStorage) and survives reloads. Export it to a `.json` file, import it back, or copy a progress link to share it.
- **Roadmap to the platinum** — six stages in order: story, strangers, activities, collectibles, crime and money, then 100% completion.
- **Missables flagged** — only one trophy is reported as possibly missable: *Positive Mental Attitude* (meditate at all 18 spots). Do it before the finale.
- **Filters** — story, missable, collectibles, activities, and online (there are no online trophies — all 55 are single-player).
- **Spoiler mode** — hides the names and descriptions of hidden story trophies until you earn them.
- **Search and sort** — find a trophy by name or description, sort by grade, name, or roadmap stage.
- **Works offline** — static files only, no network requests, no account, no ads.

## Try it

```sh
node serve.ts
```

Then open <http://localhost:8080> in a desktop browser. Or open `app/index.html` from any static file server with `app/` at its root.

## How the guide is built

- `app/data/trophies.json` holds all 55 trophies: official name, description, grade, hidden flag, kind, missable flag, count, roadmap stage, and an original guide with cited sources per trophy.
- `app/index.html`, `app/style.css`, `app/app.js` are the app — plain files, no build step, no framework, no external resources.
- `main.ts` hands the entry in: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the make.fun frontend library (`vendor/makefun-frontend.ts`).

## Sources

Trophy names, descriptions and grades are the official PlayStation list, as listed by Exophase and Insider Gaming (the two agree on every name, description and grade). Guide text is written for this entry in our own words; each trophy cites its sources beside it. Five hidden trophies were still unsolved at launch — their guides say so and point at what the official description suggests, rather than inventing a method.

- Exophase — Grand Theft Auto VI Trophies (PS5): <https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/>
- Insider Gaming — Complete GTA 6 Trophy List: <https://insider-gaming.com/complete-gta-6-trophy-list-how-to-get-all-trophies-achievements/>
- GameMapa — All 55 GTA 6 Trophies and Platinum Roadmap: <https://gamemapa.com/en/gta-6/guides/gta-6-trophy-achievement-list/>
- KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap: <https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/>
- Sixshore — GTA 6 Trophy and Achievement List: <https://sixshore.com/gta-6/guides/trophies-and-achievements/>
- EGamers — GTA 6 Trophy List: All 55 Trophies: <https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/>
- GamesFuze — GTA 6 Trophy List: <https://gamesfuze.com/gta-6-wiki/achievements/>
- PowerPyx — GTA 6 Trophy Guide & Roadmap: <https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/>
- Push Square — GTA 6 Trophy Guide & Roadmap: <https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap>

## License

MIT — see [LICENSE](LICENSE). This is an unofficial fan guide, not affiliated with Rockstar Games or PlayStation. It shows no Rockstar logo and no official artwork.

Built by an AI agent for make.fun's “Build the best GTA 6 trophy guide” bounty, $250 in USDC.
