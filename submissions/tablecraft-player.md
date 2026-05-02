# TableCraft Player

**Status:** Submitted 2026-05-02
**Repository:** https://github.com/Clarence-G/tablecraft
**npm:** https://www.npmjs.com/package/tablecraft-cli
**SKILL.md path in repo:** [`skill_data/tablecraft-player/SKILL.md`](https://github.com/Clarence-G/tablecraft/blob/main/skill_data/tablecraft-player/SKILL.md)
**License:** MIT
**Author:** Clarence G

## Short Description

Play 13+ turn-based board games (Gomoku, Connect Four, UNO, Texas Hold'em, Blackjack, Yahtzee, Hive, Love Letter, Splendor, Battleship, Codenames, Liar's Bar, Undercover) on the TableCraft multiplayer platform via a single CLI tool.

## Long Description

TableCraft is a production-grade multiplayer board game platform ([tablecraft.aster.pub](https://tablecraft.aster.pub)) with real rooms, spectator mode, bot opponents, and a live event stream. The `tablecraft-player` skill teaches an AI agent the standard interaction loop:

1. `tablecraft games rules <id>` → per-game JSON action schema
2. `tablecraft rooms join <room>` → enter a lobby
3. `tablecraft game wait <room> [--after seq]` → block until opponent moves
4. Decide the move (domain logic stays in the agent — the skill provides state + schema, not hard-coded strategy)
5. `tablecraft game action <room> '<json>'` → submit

Everything is single-line JSON on stdout, so the agent can pipe, parse, and retry deterministically. The skill codifies:
- The request→wait→act loop with `--after` sequence gating (no busy-waiting, no duplicate actions)
- The JSON contract (`{ ok, data }` vs `{ ok: false, error, message, hint }`)
- Bot ownership rules (a bot can only active one room at a time; bot token lives in `~/.tablecraft/config.json`)
- Per-game tips discovered via dogfooding (e.g. UNO color matching after wild, connect-four threat detection)

## Use Cases

- **"Play Gomoku against the bot"** — skill teaches Claude to fetch rules, join, wait for opponent stone, respond with minimax move.
- **"Spectate this UNO game and narrate it"** — `--watch` mode with live `game wait` loop, no action submit.
- **"Challenge me to Texas Hold'em"** — bot joins user's room with bot token, reads hand state, posts bets.
- **"Teach me how to play Hive by playing a practice match"** — agent plays while explaining each move via chat.

## Installation

```bash
# one-step npm install — skill bundled in the tarball
npm i -g tablecraft-cli

# symlink the bundled SKILL.md into Claude Code's skill directory
ln -s "$(tablecraft skill-path | jq -r .path)" ~/.claude/skills/tablecraft-player

# set up bot token (first run only; token from tablecraft.aster.pub bot settings)
tablecraft login --server https://tablecraft.aster.pub --token <your-bot-token>
```

After install, any prompt like *"play gomoku on tablecraft"* or *"challenge a bot in texas hold'em"* auto-loads the skill.

## Examples

### Example 1 — Play a full Gomoku match

```
User:    play gomoku against a bot on tablecraft, I want to watch
Claude:  [loads tablecraft-player skill]
         [runs `tablecraft rooms create gomoku` → room ABCD12]
         [runs `tablecraft rooms join ABCD12` as bot]
         [loops `game wait ABCD12 --after N` → decides move via minimax → `game action`]
         [reports each move as Markdown: "Bot placed at (7,7). Your turn."]
```

### Example 2 — Agent-vs-agent self-play for debugging

```
User:    run a self-play match of connect-four, log the result
Claude:  [spawns two bot identities, creates room, joins both sides]
         [loops wait+action until game ends]
         [reports: "Winner: red after 37 moves, log at /tmp/game.jsonl"]
```

### Example 3 — Join a human's live room

```
User:    join room INX71W, I'll play Connect Four with you
Claude:  [runs `tablecraft rooms join INX71W`]
         [loops `game wait` blocking on user's moves]
         [replies with its own `game action` each turn]
```

## Category

- **Gaming** (primary)
- **AI Agents** (secondary)
- **CLI Tools** (secondary)

## Tags

`board-games`, `gaming`, `multiplayer`, `gomoku`, `blackjack`, `uno`, `poker`, `bot-player`, `cli`, `json`, `ai-agent`, `claude-skill`

## Why It's Useful

Most game skills are single-game toys. TableCraft is a real platform with 13+ games, persistent rooms, spectator mode, and live events. One skill handles every game because `tablecraft games rules <id>` returns each game's JSON action schema at runtime — the agent doesn't need per-game knowledge baked in. This makes it trivial to add a new game to the platform without updating the skill.

Tested with:
- Claude Code (primary target)
- Codex CLI
- Cursor agent mode

## Novel Capability

The skill pairs with a **live server** ([tablecraft.aster.pub](https://tablecraft.aster.pub)) — not a local stub. Agents face real human opponents who can also spectate / chat. This flips the usual "agent plays toy chess against itself" pattern to "agent is a real multiplayer citizen".
