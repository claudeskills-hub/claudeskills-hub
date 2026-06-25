### Skill Name
coding-agent-pm

### Short Description
Plan, assign, review, and verify coding-agent work.

### Long Description
`coding-agent-pm` gives founders, product engineers, and PMs a lightweight operating loop for working with coding agents such as Claude Code, Codex, OpenClaw, and similar tools. It helps users define scope, write acceptance criteria, delegate bounded implementation tasks, review diffs, catch drift, and require concrete validation before accepting work.

The repository includes an installable `SKILL.md` plus practical templates for agent briefs, task plans, prompt snippets, review checklists, and first-week workflow tracking.

### Use Cases
- Assign a coding agent a scoped implementation task with explicit file/module boundaries.
- Review an agent-generated diff for regressions, missing acceptance criteria, weak validation, and scope drift.
- Recover a drifting agent task by mapping changes back to the original acceptance criteria.
- Standardize PM-to-agent handoffs for small teams adopting Claude Code, Codex, OpenClaw, or related coding agents.

### Installation
Clone or download the public repository, then copy it into your agent skills folder:

```bash
git clone https://github.com/kiwi-phantomworks/claude-code-pm-starter-pack.git ~/.claude/skills/coding-agent-pm
```

Common skill locations:

- Claude Code: `~/.claude/skills/coding-agent-pm`
- Codex: `~/.codex/skills/coding-agent-pm`
- OpenClaw: `~/.openclaw/skills/coding-agent-pm`

### Examples
1. "Use `coding-agent-pm` to turn this feature request into an implementation brief for Codex."
2. "Use `coding-agent-pm` to review this agent diff and list blocking issues first."
3. "Use `coding-agent-pm` to rewrite this vague task into acceptance criteria and validation commands."

### Category
Development

### Tags
development, coding-agents, product-management, agent-workflows, code-review, claude-code, codex

### Repository URL
https://github.com/kiwi-phantomworks/claude-code-pm-starter-pack

### License
MIT

### Your Contact
Bridge AI Labs / PhantomWorks: kiwi@phantomworks.io
