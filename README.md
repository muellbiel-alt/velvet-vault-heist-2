# Velvet Vault

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/muellbiel-alt/velvet-vault-heist-2/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/muellbiel-alt/velvet-vault-heist-2/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down heist game for the [make.fun best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559). One room, one night: sneak past three patrolling guards and two sweeping security cameras, lift the Velvet Diamond from its pedestal, and slip out the green getaway door before the alarm hits 100%.

## How to play

- **WASD / arrow keys** — move
- **Shift** — sneak (slower, but the alarm climbs half as fast while you are seen)
- **Q or click** — toss a coin to pull the nearest guard off his patrol
- **E** — smoke bomb, switches nearby cameras off for 8 seconds
- **P / Esc** — pause, **M** — mute

The room is the whole game: display cases and pillars break sightlines, velvet ropes mark the main route, and every vision cone is raycast against the furniture, so what you see is what the guards see. Getting spotted raises the alarm; breaking line of sight lets it fall again. Grab the diamond, then reach the green door — gold bars on the side pedestals are worth extra, and a quiet, quick job scores best.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests, no libraries: plain static files under `game/`, all sounds synthesized live with WebAudio.

## Layout

- `game/src/core/` — constants, seeded random, keyboard/mouse input
- `game/src/world/` — the vault hall (room, collision, sightlines) and the world state
- `game/src/entities/` — thief, guards, cameras
- `game/src/systems/` — vision-cone raycasting and the alarm meter
- `game/src/ui/` — canvas renderer and screen overlays
- `game/src/audio/` — WebAudio synth (footsteps, camera beeps, pickups, alert)
- `main.ts` — the hand-in program (Node 22), copies `game/` + `screenshots/` to `/output` and writes `dossier.json`

MIT licensed. Original game: names, art, sounds and code are all our own.
