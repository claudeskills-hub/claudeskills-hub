### Skill Name
Agent Flow

### Short Description
Context-drift detection, guardrails and enforced Implement → Review → QA for coding agents.

### Long Description
Agent Flow keeps agent context files honest and agent pipelines enforceable. `agent-flow doctor` checks every path your context files mention (manifest and backticked paths in prose) against the real filesystem, so CI goes red before an agent builds on a false premise. Reviewer and QA run as separate processes that cannot write code; implementers are confined to their worktree; protected paths, `--no-verify`, force-pushes and pushes to main are blocked. `agent-flow classify` and `audit-risk` gate risky diffs mechanically. Works with Claude Code, Codex CLI, Gemini CLI, Cursor, GitHub Copilot, Windsurf, Pi, and any tool that reads AGENTS.md. Zero runtime dependencies, no network calls, no telemetry, MIT licensed.

Demo video: https://github.com/user-attachments/assets/3acb0531-93c1-4770-a5e9-d26491bfe4c4

### Use Cases
- Use case 1: CI gate that fails when AGENTS.md references files that were renamed or deleted (`npx agent-flow doctor`).
- Use case 2: Enforced Implement → Review → QA pipeline with a bounded review loop that escalates to a human with a decision brief.
- Use case 3: Pre-commit hook plus `audit-risk` that flags new dependencies, auth/payment code, destructive data ops and secrets before they land.

### Installation
```bash
npm install -D @drix10/agent-flow
npx agent-flow install --harness claude     # or codex | gemini | cursor | copilot | windsurf | agents
# — or via the skills CLI:
npx skills add Drix10/agent-flow
# Pi:
pi install npm:@drix10/agent-flow
```

### Examples
1. Someone renames `src/users/service.ts` — `npx agent-flow doctor` fails with `AGENTS.md: src/users/service.ts (prose)`, blocking the PR.
2. Someone adds `stripe` — `npx agent-flow audit-risk --fail-on-new` flags the new payment dependency surface.
3. An agent edits `src/payments/charge.ts` — `npx agent-flow classify` returns `risk: critical, human approval: required`.

### Category
- Development

### Tags
context-drift, guardrails, code-review, agents-md, multi-agent, testing, orchestration

### Repository URL
https://github.com/Drix10/agent-flow

### Your Contact
https://github.com/Drix10
