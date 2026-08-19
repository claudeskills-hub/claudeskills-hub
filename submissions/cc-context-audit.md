### Skill Name

cc-context-audit

### Short Description

Audit Claude Code session context cost with evidence-tagged best-practice checks.

### Long Description

cc-context-audit reads local `~/.claude/projects/**/*.jsonl` logs and produces a structured Markdown audit report answering three questions:

1. **What's in context each turn?** Fixed overhead (tools, system prompt, CLAUDE.md) vs accumulated content (model output, tool returns, user input)
2. **Where does cost go?** By content source and by token type (cache read / cache write / output), with effective unit prices derived from real data
3. **Which best practices are violated?** 10 rules with evidence-level tags (measured / calibrated / heuristic) and actionable savings ranked by real impact

It complements [ccusage](https://ccusage.com/) — ccusage answers "how much did I spend", cc-context-audit answers "why is my context so big and what can I do about it".

Key design decisions:
- Thresholds from data percentiles, not hardcoded absolutes
- Every conclusion tagged with evidence level
- Distinguishes "region size" vs "actionable savings"
- Cache-write rules use mutually exclusive session grouping to avoid double-counting

### Use Cases

- Use case 1: Diagnose why a specific project's Claude Code sessions consume excessive tokens
- Use case 2: Identify the highest-impact optimization — e.g., "compact before leaving saves $85/month on cache writes"
- Use case 3: Share anonymized audit reports with team leads to justify workflow changes

### Installation

```bash
# Clone and run directly
git clone https://github.com/kuhung/cc-context-audit
cd cc-context-audit
python3 scripts/parse.py --out /tmp/cc-metrics.json
python3 scripts/report.py /tmp/cc-metrics.json > report.md

# Or install as a Claude Code skill
npx skills add kuhung/cc-context-audit
```

### Examples

**Example 1: Full audit**
```bash
python3 scripts/parse.py --out /tmp/cc-metrics.json
python3 scripts/report.py /tmp/cc-metrics.json > report.md
```

**Example 2: Redacted report for sharing**
```bash
python3 scripts/parse.py --redact --out /tmp/cc-metrics.json
python3 scripts/report.py /tmp/cc-metrics.json > report.md
```

**Example 3: Audit since a specific date with USD costs**
```bash
python3 scripts/parse.py --since 2026-07-01 --usd --out /tmp/cc-metrics.json
python3 scripts/report.py /tmp/cc-metrics.json > report.md
```

### Category

Data Analysis

### Tags

claude-code, context-audit, cost-optimization, token-analysis, best-practices, python

### Repository URL

https://github.com/kuhung/cc-context-audit

### Your Contact

- GitHub: [@kuhung](https://github.com/kuhung)
- Email: hi@kuhung.me
