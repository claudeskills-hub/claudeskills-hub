---
name: commit-analyzer
version: 1.0.0
description: Analyzes Git commits to generate developer work reports. Supports single and multi-project analysis with intelligent categorization (feat, fix, docs, etc.), flexible date ranges, language switching, and merge commit filtering. Perfect for daily, weekly, and monthly reports. **Triggered when:** user explicitly requests to summarize development work for a specific day, week, or date range (e.g., "summarize today's work", "weekly report", "what did I do in February").
tags:
  - git
  - development
  - productivity
  - reporting
  - automation
  - multi-project
---

# 🚀 Commit Analyzer

> **Developer-focused Git commit analysis tool**. Generate personal and team work reports with a single command. Supports single and multi-project analysis, intelligent categorization, and flexible reporting formats. Essential for daily standups, weekly reports, and project progress summaries.

## 💡 Key Features

- ✅ **Generate Reports Instantly**: Create daily, weekly, and monthly reports with one command
- ✅ **Smart Commit Classification**: Automatically categorizes commits into 9+ types (feat, fix, docs, test, refactor, perf, style, ci, chore)
- ✅ **Multi-Project Analysis**: Batch analyze multiple projects with automatic summary reports
- ✅ **Flexible Query Options**: Date ranges, merge commit filtering, multiple language output, project filtering
- ✅ **Intelligent File Inference**: Non-standard commits are auto-classified based on file patterns
- ✅ **Developer-Friendly**: Clean output format with English and Chinese support, optimized for reporting

## ⚡ Quick Start (10 seconds to master)

### Installation

The skill is automatically available through Claude Code. Simply use the `gca` command:

```bash
gca --help
```

### Common Scenarios Quick Reference

| Use Case | Command | Description |
|----------|---------|-------------|
| 📊 **Today's Work** | `gca --summary` | View today's commits (most common) |
| 📅 **Weekly Report** | `gca --summary --after "2026-03-03" --before "2026-03-09"` | View Monday to Sunday |
| 📈 **Monthly Report** | `gca --summary --all` | View all project commits |
| 👥 **Multi-Project Analysis** | `gca --summary --config projects.config.json` | Analyze all projects at once |
| 📍 **Specific Date** | `gca --summary --after "2026-03-06" --before "2026-03-06"` | View a specific date |
| 🆘 **Help** | `gca --help` or `gca -h` | View complete documentation |

### Core Concepts

**Conventional Commits Format**: `<type>(<scope>): <subject>`
- Example: `feat(auth): Add two-factor authentication` / `fix(login): Fix login timeout`
- Supported types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `chore`

**Smart File Inference**: Non-standard commits are auto-classified by file patterns
- `.test.ts`, `.spec.js` → 🧪 Tests
- `.css`, `.scss`, `.less` → 🎨 Styles
- `.md`, `README` → 📝 Documentation
- Others → Inferred by file type

## Parameters Reference

### Summary Mode Parameters

Use the `--summary` flag to enable statistics mode.

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `--summary` | flag | Enable commit statistics mode (required) | `--summary` |
| `--all` | flag | Analyze all commits from current user | `--all` |
| `--include-files` | flag | Include file list for each commit | `--include-files` |
| `--exclude-merge` | flag | Exclude merge commits (included by default) | `--exclude-merge` |
| `--lang` | string | Output language: `en` (English) or `zh` (Chinese), default is English | `--lang zh` |
| `--after` | string | Start date for analysis (ISO 8601 format YYYY-MM-DD) | `--after "2026-03-01"` |
| `--before` | string | End date for analysis (ISO 8601 format YYYY-MM-DD) | `--before "2026-03-10"` |
| `--config` | string | Multi-project analysis using config file | `--config projects.config.json` |
| `--all-projects` | flag | Analyze all Git projects found (scans parent directories) | `--all-projects` |
| `--project` | string | Analyze specific project path | `--project "path/to/project"` |

### Parameter Rules

| Rule | Description |
|------|-------------|
| Time Exclusivity | `--all` and `--after/--before` are mutually exclusive; `--all` has higher priority |
| Project Exclusivity | `--config`, `--all-projects`, and `--project` are mutually exclusive; priority: `--config` > `--project` > `--all-projects` > current project |
| Default Date | If no date is specified, analyzes commits from **today** by default |
| Time Limit | ⚠️ Maximum 30-day span per query; for single day use `--after "2026-03-01" --before "2026-03-01"` |
| Default Values | Includes merge commits / analyzes entire branch / analyzes current project / **date defaults to today** |
| Combinable | `--include-files` and `--exclude-merge` can be combined with any other parameters |

## 📝 Typical Use Cases

### Scenario 1️⃣: Daily Work Summary
**Need**: "What did I work on today?"
```bash
gca --summary
```
**Output**: Detailed categorized statistics of today's commits

---

### Scenario 2️⃣: Weekly Report
**Need**: "Summary of this week's work"
```bash
gca --summary --after "2026-03-03" --before "2026-03-09"
```
**Output**: All commits from Monday to Sunday, organized by category

---

### Scenario 3️⃣: Multi-Project Analysis
**Need**: "Summary of work across all my projects"
```bash
# Create projects.config.json
{
  "projects": [
    "F:/project1",
    "F:/project2",
    "F:/project3"
  ]
}

# Run analysis
gca --summary --config projects.config.json
```
**Output**:
- Individual statistics per project
- Combined summary across all projects

---

### Scenario 4️⃣: Multi-Project Analysis for Specific Date
**Need**: "View work from all projects on March 6th"
```bash
gca --summary --after "2026-03-06" --before "2026-03-06" --config projects.config.json
```

---

### Scenario 5️⃣: English Report for International Team
**Need**: "Generate work report in English"
```bash
gca --summary --lang en
```

---

### Scenario 6️⃣: Exclude Merge Commits
**Need**: "Show only real work, no merge commits"
```bash
gca --summary --exclude-merge
```

### 📊 Output Examples (Single Project Mode)
```
============================================================
📊 Git Commit Statistics Report
👤 User: John Developer
📈 Total: 9 commits
============================================================

🐛 Bug Fixes (3)
  📅 2026-03-06
    1. fix: Resolve code diff calculation
    2. fix: Fix marketing campaign lottery issue
    3. fix: Adjust repurchase referral filter

✨ Features (1)
  📅 2026-03-06
    1. feat: Add toggle for lottery prize slot visibility

🔀 Merge Commits (5)
  📅 2026-03-06
    1. Merge branch 'feature-xxx' into prd-20260306
    ...

============================================================
```

### 📊 Output Examples (Multi-Project Mode)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Project: zhzq-app      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━┫
📊 Project Git Commit Statistics
📈 Total: 9 commits

🐛 Bug Fixes (3)
  📅 2026-03-06
    1. fix: ...

...

┏━━━━━━━━━━━━ All Projects Summary ━━━━━━━━━━━━┓
📊 Git Commit Statistics Report
👤 User: John Developer
📈 Total: 13 commits (4 projects)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🐛 Bug Fixes (7)
✨ Features (1)
🔀 Merge Commits (5)
```


## ❓ FAQ

| Question | Answer |
|----------|--------|
| **📅 What time period does it analyze by default?** | By default, analyzes **today's** commits when no date is specified |
| **👤 Whose commits are being analyzed?** | Commits from the current Git user (`git config user.name`) |
| **❌ Why are there fewer commits than expected?** | Possible reasons: ①Merge commits (exclude with `--exclude-merge`) ②Commits from other users ③Outside date range |
| **✏️ How do I change the user being analyzed?** | Use `git config user.name "New Name"` (for current project) or `--global` (globally) |
| **📊 How do I format the multi-project config file?** | See "Configuration File Format" section below |
| **🌳 Which projects does `--all-projects` scan?** | Automatically scans all projects with `.git` in parent and child directories |
| **🔀 How do I analyze a specific branch?** | First switch to branch with `git checkout branch-name`, then run the command |
| **📈 What's the maximum time span I can analyze?** | Maximum 30-day span per query; for single day use `--after "YYYY-MM-DD" --before "YYYY-MM-DD"` |

## Technical Specifications

- **Supported Systems**: Windows, macOS, Linux
- **Dependencies**: Git CLI (must be installed on system)
- **Performance**: Supports 10,000+ commits, 100% read-only, does not block other Git operations
- **Data Source**: `git log` output and file change analysis
- **User Identification**: Based on `git config user.name` (only analyzes commits from current user)

## 📋 Configuration File Format

### Multi-Project Configuration (projects.config.json)
```json
{
  "description": "Project list configuration (optional)",
  "projects": [
    "F:/projects/project1",
    "F:/projects/project2",
    "F:/projects/project3"
  ]
}
```

**Notes**:
- Project paths must be valid Git repositories
- Invalid paths are automatically skipped without affecting other projects
- Supports both relative and absolute paths

---

## 💡 Developer Best Practices

### ✅ Recommended Practices
1. **Check Every Morning**: `gca --summary` - Understand your daily work volume
2. **Generate Weekly Report on Monday**: `gca --summary --after "2026-03-03" --before "2026-03-09"` - Quickly compile weekly report
3. **Create Config File**: For multi-project management, create `projects.config.json`
4. **Regular Monthly Review**: Use `gca --summary --all` at month-end to review monthly work

### ❌ Common Pitfalls
1. ❌ Always using `--all` parameter - Unnecessary, default today is sufficient
2. ❌ Writing commit messages casually - Follow Conventional Commits standard for accurate statistics
3. ❌ Forgetting to switch Git user - Statistics are for current Git configured user only
4. ❌ Querying across 30+ days - Will be rejected; use `--all` or query in segments instead

### 📌 Conventional Commits Standard
Commit messages should follow this format:
```
<type>(<scope>): <subject>

<body>
```

Supported `<type>` values:
- `feat`: New feature ✨
- `fix`: Bug fix 🐛
- `docs`: Documentation 📝
- `test`: Tests 🧪
- `refactor`: Refactoring 🔧
- `perf`: Performance optimization ⚡
- `style`: Code style 🎨
- `ci`: CI/CD 🔌
- `chore`: Other changes ⚙️

---

## 📌 Release Information

**Version**: 1.0.0
**Release Date**: 2026-03-12
**Status**: Stable
**License**: MIT

### Features in this Release
- ✅ Multi-project analysis with project-level reports
- ✅ Global summary across all projects
- ✅ Intelligent commit categorization
- ✅ Multi-language support (English/Chinese)
- ✅ Flexible date range queries
- ✅ Smart file-based inference
