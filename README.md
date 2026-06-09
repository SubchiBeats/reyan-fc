# Reyan FC ⚽

**▶ Play it live: [subchibeats.github.io/reyan-fc](https://subchibeats.github.io/reyan-fc/)**

![Stack: vanilla JS](https://img.shields.io/badge/stack-vanilla%20JS-f7df1e) ![Build: none](https://img.shields.io/badge/build-none-2ea44f) ![Runs in: browser](https://img.shields.io/badge/runs%20in-browser-1572b6) ![License: MIT](https://img.shields.io/badge/license-MIT-blue)

An **FC26-style squad builder** web app — build dream teams from real players, chase
chemistry, rip open packs, conquer SBCs, and win the league in Season mode. Works on
**desktop and mobile**, with zero build step (pure HTML/CSS/JS).

Inspired by the FUTBIN squad builder, but reimagined to be more playful and rewarding.

## Features

- **⚽ Squad Builder** — drop real players into 8 formations on an interactive pitch.
  Live FC-style **chemistry** (club / league / nation links) and **squad rating**.
  Search & filter the full player database, auto-fill a best XI, save/load squads.
- **🎁 Pack Store & Openings** — 7 pack tiers (Bronze → Icon) with real odds, an
  animated reveal experience and **walkout** flair for elites, specials and Icons.
- **🧩 SBCs (Squad Building Challenges)** — submit squads built from your club to earn
  coins + packs. Submitted players are consumed, so completing challenges funds the next.
  Repeatable and one-time (e.g. **Icon Quest**) challenges with live requirement checks.
- **🏆 Season Mode** — take your XI into an 8-team league (round-robin), simulate
  matchdays with a chemistry-aware match engine, climb the table and claim rewards by
  finishing position. Three difficulty levels.
- **👥 My Club** — your collection with stats, filters, duplicate badges and quick-sell.
- **💾 Persistence** — coins, club, saved squads, SBC progress and season all save to
  `localStorage`. Stable name-based player IDs mean roster updates won't corrupt saves.

## Player data

~226 real players reflecting the **2025-26 season** (clubs, nations and FC-style stats —
PAC/SHO/PAS/DRI/DEF/PHY), spanning Icons/Heroes down to bronzes, plus a spread of leagues
and nations so chemistry, packs and SBCs all work. Ratings & stats are approximations in
the FC style. Add players by editing `js/data/players.js` (one `m(...)` line each).

## Run locally

It's a static site — any static server works. For example:

```powershell
# from the reyan-fc folder
python -m http.server 4173
# then open http://localhost:4173
```

> Open via `http://` (a server), not `file://` — the page loads multiple scripts and
> fetches flag images over the network.

## Deploy

Drop the `reyan-fc` folder onto **Netlify**, or push to a repo and enable **GitHub Pages**
(serve from root). No build configuration required.

## Project structure

```
reyan-fc/
  index.html
  css/styles.css
  js/
    core/    utils.js · chemistry.js · state.js
    data/    players.js · formations.js · packs.js · sbcs.js
    ui/      components.js · builder.js · packsview.js · sbc.js · season.js · club.js
    app.js   (shell, router, bootstrap)
```

External dependencies (all degrade gracefully if offline): country flags from
[flagcdn.com](https://flagcdn.com), **real player photos** fetched from the
Wikipedia REST API (CC-licensed thumbnails, cached in `localStorage` after first load),
and the **Outfit** font from Google Fonts. Club badges are generated locally from
initials + team colors. Everything else is self-contained.

If Wikipedia can't find a player's article or returns no thumbnail, the card falls back
to the player's initials inside the photo frame.

## License

MIT © Sahib Singh — see [LICENSE](LICENSE).

This is an unofficial fan project. Player names, club/league/nation data and ratings are
approximations created for this game and are **not** affiliated with, endorsed by, or
sourced from EA Sports, FUTBIN, or any club, league or governing body. Player photos are
CC-licensed thumbnails fetched at runtime from Wikipedia and remain under their own licenses.
