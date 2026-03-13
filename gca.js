#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Get Git user name from specified path or global config
 */
function getUserFromPath(projectPath) {
  try {
    return execSync(`git -C "${projectPath}" config user.name`, { encoding: 'utf-8' }).trim();
  } catch (e) {
    return null;
  }
}

/**
 * Get current Git user name
 */
function getCurrentUser() {
  try {
    return execSync('git config user.name', { encoding: 'utf-8' }).trim();
  } catch (e) {
    console.error('❌ Unable to get Git user info. Please ensure you are in a Git repository.');
    process.exit(1);
  }
}

/**
 * Format date object to YYYY-MM-DD string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adjust date by specified number of days
 */
function adjustDate(dateStr, days = 0) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Add one day to a date string
 */
const addOneDay = (d) => adjustDate(d, 1);

/**
 * Subtract one day from a date string
 */
const subtractOneDay = (d) => adjustDate(d, -1);

/**
 * Get today's date as YYYY-MM-DD string
 */
const getTodayDate = () => formatDate(new Date());

/**
 * Constants
 */
const GIT_SHORT_HASH_LENGTH = 7;
const MAX_DATE_RANGE_DAYS = 30;
const TOP_FILE_TYPES_COUNT = 3;
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Check if commit is a merge commit
 */
function isMergeCommit(message) {
  return message.toLowerCase().startsWith('merge');
}

/**
 * Check if commit message is non-standard format
 */
function isNonStandardCommit(message) {
  return !message.match(/^(feat|fix|docs|style|refactor|perf|test|ci|chore)/i);
}

/**
 * Group items by date
 */
function groupByDate(items) {
  const grouped = {};
  items.forEach(item => {
    grouped[item.date] ??= [];
    grouped[item.date].push(item);
  });
  return grouped;
}

/**
 * Get all commits matching criteria
 */
function getCommits(args = {}, projectPath = '.', currentUser = null) {
  try {
    const { after, before, all } = args;
    let cmd = `git log --format=%H%n%an%n%ad%n%s%n%b%n%D%n--- --date=short`;

    // Add user filter
    if (currentUser) {
      cmd += ` --author="${currentUser}"`;
    }

    // Add time range filter with loose bounds for git, precise filtering during parsing
    // Use previous day as 'after' to catch boundary commits
    if (after) {
      const widerAfter = subtractOneDay(after);
      cmd += ` --after="${widerAfter}"`;
    }
    if (before) {
      const beforeStr = addOneDay(before);
      cmd += ` --before="${beforeStr}"`;
    }

    // Execute command in specified directory
    const output = execSync(cmd, {
      encoding: 'utf-8',
      cwd: projectPath
    });

    // Parse and filter by exact date
    return parseCommits(output, after, before);
  } catch (e) {
    return [];
  }
}

/**
 * Parse git log output
 */
function parseCommits(output, afterDate = null, beforeDate = null) {
  const commits = [];
  const entries = output.split('---').filter(e => e.trim());

  entries.forEach(entry => {
    const lines = entry.trim().split('\n');
    if (lines.length < 3) return;

    const commit = {
      hash: lines[0].trim(),
      author: lines[1].trim(),
      date: lines[2].trim(),
      message: lines[3].trim(),
      body: lines.slice(4).join('\n').trim(),
      refs: lines[lines.length - 1]?.trim() || ''
    };

    // Exact date filtering (avoid timezone boundary issues)
    if (afterDate && commit.date < afterDate) return;
    if (beforeDate && commit.date > beforeDate) return;

    commits.push(commit);
  });

  return commits;
}

/**
 * Categorize commits by convention
 */
function categorizeCommit(commit, lang = 'zh') {
  const msg = commit.message.toLowerCase();
  const t = i18n[lang];

  // Special handling for merge commits
  if (isMergeCommit(commit.message)) {
    return { key: 'merge', emoji: '🔀', label: t.merge, keywords: ['merge'] };
  }

  const categories = {
    'feat': { emoji: '✨', label: t.feature, keywords: ['feat', 'feature', 'new', 'add', 'implement'] },
    'fix': { emoji: '🐛', label: t.bugFix, keywords: ['fix', 'bug', 'hotfix', 'patch', 'issue', 'resolve'] },
    'docs': { emoji: '📝', label: t.docs, keywords: ['docs', 'document', 'readme', 'comment', 'doc'] },
    'style': { emoji: '🎨', label: t.style, keywords: ['style', 'format', 'lint'] },
    'refactor': { emoji: '🔧', label: t.refactor, keywords: ['refactor', 'refactoring'] },
    'perf': { emoji: '⚡', label: t.perf, keywords: ['perf', 'performance', 'optimize', 'improvement'] },
    'test': { emoji: '🧪', label: t.test, keywords: ['test', 'unit test', 'integration test', 'test case'] },
    'ci': { emoji: '🔌', label: t.ci, keywords: ['ci', 'cd', 'build', 'deploy'] },
    'chore': { emoji: '⚙️', label: t.chore, keywords: ['chore', 'bump', 'update deps', 'upgrade'] }
  };

  for (const [key, cat] of Object.entries(categories)) {
    if (cat.keywords.some(kw => msg.includes(kw))) {
      return { key, ...cat };
    }
  }

  return { key: 'other', emoji: '♻️', label: t.other, keywords: [] };
}

/**
 * Get files changed in a commit
 */
function getCommitFiles(hash) {
  try {
    const output = execSync(`git show --name-status --format= ${hash}`, { encoding: 'utf-8' });
    const files = output.trim().split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\t');
        return {
          status: parts[0],
          file: parts[1]
        };
      });
    return files;
  } catch (e) {
    return [];
  }
}

/**
 * Infer category from non-standard commits based on files
 */
function inferCategoryFromFiles(files) {
  if (!files.length) return null;

  const filePatterns = {
    'docs': [/\.(md|txt)$/i, /README/, /CHANGELOG/],
    'test': [/\.(test|spec)\.(ts|js)$/i, /^(tests?|__tests__)\//],
    'style': [/\.(css|scss|less)$/i],
    'refactor': [/\.vue$/i, /\.tsx?$/i], // Vue/TS changes
    'perf': [/api|service|util/i],
    'feat': [/components|pages|views/i],
    'fix': [] // Default categorization as fix
  };

  const scores = {};

  files.forEach(f => {
    for (const [cat, patterns] of Object.entries(filePatterns)) {
      if (patterns.some(p => p.test(f.file))) {
        scores[cat] = (scores[cat] || 0) + 1;
      }
    }
  });

  if (Object.keys(scores).length === 0) return null;

  const topCat = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const emoji = { docs: '📝', test: '🧪', style: '🎨', refactor: '🔧', perf: '⚡', feat: '✨', fix: '🐛' }[topCat];
  const label = { docs: 'Documentation', test: 'Testing', style: 'Style', refactor: 'Refactor', perf: 'Performance', feat: 'Feature', fix: 'Bug Fix' }[topCat];

  return { key: topCat, emoji, label, keywords: [] };
}

/**
 * Generate file change summary
 */
function generateFileSummary(files) {
  if (!files.length) return '';

  const fileTypes = {};
  files.forEach(f => {
    const ext = path.extname(f.file) || 'other';
    fileTypes[ext] = (fileTypes[ext] || 0) + 1;
  });

  const summary = Object.entries(fileTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_FILE_TYPES_COUNT)
    .map(([ext, count]) => `${ext || 'other'}(${count})`)
    .join(', ');

  return `Modified files: ${summary}`;
}

/**
 * Filter commits from current user
 */
function filterByCurrentUser(commits, currentUser, includeMerge = false) {
  return commits.filter(c => {
    if (c.author !== currentUser) return false;

    // If it's a merge commit
    if (isMergeCommit(c.message)) {
      // Keep if merge flag present, otherwise exclude
      return includeMerge;
    }

    return true;
  });
}

/**
 * Validate time range
 */
function validateTimeRange(after, before) {
  if (!after && !before) {
    return true; // Default time range is valid
  }

  // Check date format
  if (after && !DATE_FORMAT_REGEX.test(after)) {
    console.error(`❌ Date format error: ${after}, please use YYYY-MM-DD format`);
    process.exit(1);
  }
  if (before && !DATE_FORMAT_REGEX.test(before)) {
    console.error(`❌ Date format error: ${before}, please use YYYY-MM-DD format`);
    process.exit(1);
  }

  // Check time range logic
  if (after && before && after > before) {
    console.error(`❌ Time range error: --after cannot be later than --before`);
    process.exit(1);
  }

  // Check time span does not exceed MAX_DATE_RANGE_DAYS
  if (after && before) {
    const [afterY, afterM, afterD] = after.split('-').map(Number);
    const [beforeY, beforeM, beforeD] = before.split('-').map(Number);

    const startDate = new Date(afterY, afterM - 1, afterD);
    const endDate = new Date(beforeY, beforeM - 1, beforeD);

    const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (daysDiff > MAX_DATE_RANGE_DAYS) {
      console.error(`❌ Time span too long: ${daysDiff} days, maximum is ${MAX_DATE_RANGE_DAYS} days`);
      console.error(`💡 Current range: ${after} to ${before}`);
      process.exit(1);
    }
  }

  return true;
}

/**
 * Find all project paths
 */
function findAllProjects(baseDir = process.cwd()) {
  const projects = [];

  try {
    // Look in environment variables or default directory
    const searchPaths = [
      path.join(path.dirname(baseDir), '..'), // Parent directory
      baseDir, // Current directory
    ];

    for (const searchPath of searchPaths) {
      if (!fs.existsSync(searchPath)) continue;

      const items = fs.readdirSync(searchPath, { withFileTypes: true });

      for (const item of items) {
        if (!item.isDirectory()) continue;
        const fullPath = path.join(searchPath, item.name);
        const gitPath = path.join(fullPath, '.git');

        if (fs.existsSync(gitPath)) {
          projects.push(fullPath);
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return projects;
}

/**
 * Language configuration
 */
const i18n = {
  zh: {
    title: 'Git Commit Statistics Report',
    user: 'User',
    project: 'Project',
    total: 'Total',
    bugFix: 'Bug Fix',
    feature: 'Feature',
    docs: 'Documentation',
    style: 'Code Style',
    refactor: 'Refactor',
    perf: 'Performance',
    test: 'Testing',
    ci: 'CI/CD',
    chore: 'Chore',
    merge: 'Merge',
    other: 'Other',
    noCommits: 'No commits in this period',
    allProjects: 'All Projects',
    date: 'Date',
    modifiedFiles: 'Modified Files',
    inferred: 'Inferred',
    detail: 'Details',
    items: 'items'
  },
  en: {
    title: 'Git Commit Statistics Report',
    user: 'User',
    project: 'Project',
    total: 'Total',
    bugFix: 'Bug Fix',
    feature: 'Feature',
    docs: 'Documentation',
    style: 'Code Style',
    refactor: 'Refactor',
    perf: 'Performance',
    test: 'Testing',
    ci: 'CI/CD',
    chore: 'Chore',
    merge: 'Merge',
    other: 'Other',
    noCommits: 'No commits in this period',
    allProjects: 'All Projects',
    date: 'Date',
    modifiedFiles: 'Modified Files',
    inferred: 'Inferred',
    detail: 'Details',
    items: 'items'
  }
};

/**
 * Get command-line argument value
 */
function getArgValue(argName) {
  const withEquals = process.argv.find(arg => arg.startsWith(argName + '='));
  if (withEquals) {
    return withEquals.split('=')[1];
  }

  const idx = process.argv.indexOf(argName);
  if (idx >= 0 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }

  return undefined;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           Git Commit Analyzer - Help                        ║
╚════════════════════════════════════════════════════════════╝

📖 Description:
   Analyze Git commits and generate work summary reports. Supports
   multi-dimensional analysis by date range, user, project, and more.

⚡ Quick Start:
   gca --summary                   # Analyze today's commits (recommended)
   gca --summary --all             # Analyze all commits
   gca --summary --after 2026-03-01 --before 2026-03-10  # Specific date range

📋 Common Parameters:
   --summary              Enable commit statistics mode (required)
   --all                  Analyze all commits
   --after "YYYY-MM-DD"   Analysis start date (default: today)
   --before "YYYY-MM-DD"  Analysis end date (default: today)
   --include-files        Include detailed file lists
   --exclude-merge        Exclude merge commits
   --lang zh|en           Output language (default: English)
   --config "path"        Use project list from config file
   --all-projects         Analyze all Git projects
   --project "path"       Analyze specific project

🎯 Usage Examples:
   # View today's work
   gca --summary

   # Generate weekly report
   gca --summary --after 2026-03-03 --before 2026-03-09

   # View all commits with file details
   gca --summary --all --include-files

   # Switch to Chinese output
   gca --summary --all --lang zh

   # Analyze multiple projects using config file
   gca --summary --config projects.config.json

   # Multi-project analysis for specific date range
   gca --summary --after 2026-03-06 --before 2026-03-06 --config projects.config.json

💡 Parameter Priority:
   1. --all parameter (highest)
   2. Specified date range
   3. Default today (lowest)

📚 More Information:
   See SKILL.md for complete documentation

╔════════════════════════════════════════════════════════════╗
║                    Happy Analyzing! 😊                     ║
╚════════════════════════════════════════════════════════════╝
`);
}

/**
 * Format commit display with body and file inference
 */
function formatCommitDisplay(commit, files, lang) {
  let displayMsg = commit.message;
  const isNonStd = isNonStandardCommit(commit.message);

  if (!isMergeCommit(commit.message) && isNonStd && commit.body) {
    displayMsg = `${commit.message}\n  💡 ${i18n[lang].detail}: ${commit.body.split('\n')[0]}`;
  }

  let fileSummary = '';
  if (!isMergeCommit(commit.message) && isNonStd && files.length > 0) {
    const inferredCategory = inferCategoryFromFiles(files);
    if (inferredCategory) {
      displayMsg += `\n  📂 ${i18n[lang].inferred}: [${inferredCategory.emoji} ${inferredCategory.label}]`;
    }
    fileSummary = generateFileSummary(files);
  }

  return { displayMsg, fileSummary };
}

/**
 * Load project list from config file
 */
function loadProjectsFromConfig(configPath) {
  try {
    const fullPath = path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Config file not found: ${fullPath}`);
      process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    return config.projects || [];
  } catch (e) {
    console.error(`❌ Unable to read config file: ${e.message}`);
    process.exit(1);
  }
}

/**
 * Convert to Markdown format (easy to copy to documents)
 */
function convertToMarkdown(categorized, t, order, user, isMultiProject = false, projectCount = 0) {
  let output = '';

  // Header
  output += `# 📊 ${t.title}\n\n`;
  output += `- **${t.user}**: ${user}\n`;
  output += `- **${t.total}**: `;

  let totalCount = 0;
  for (const cat of Object.values(categorized)) {
    totalCount += cat.items.length;
  }
  output += `${totalCount} ${t.items}`;

  if (isMultiProject) {
    output += ` (${projectCount} ${t.project})`;
  }
  output += `\n\n`;

  // Category details
  for (const key of order) {
    if (categorized[key]) {
      const cat = categorized[key];
      output += `## ${cat.emoji} ${cat.label} (${cat.items.length})\n\n`;

      // Group by date
      const itemsByDate = groupByDate(cat.items);

      // Output in date order
      Object.keys(itemsByDate).sort().reverse().forEach(date => {
        output += `### 📅 ${date}\n\n`;
        itemsByDate[date].forEach((item, idx) => {
          output += `${idx + 1}. ${item.message}\n`;
        });
        output += `\n`;
      });
    }
  }

  return output;
}

/**
 * Categorize commits for a single project
 * Cache file information to avoid N+1 git commands
 */
function categorizeProjectCommits(projectCommits, lang = 'en') {
  const categorized = {};

  // Pre-cache all file information to avoid N+1 git command issue
  const fileCache = new Map();
  projectCommits.forEach(commit => {
    if (!fileCache.has(commit.hash)) {
      fileCache.set(commit.hash, getCommitFiles(commit.hash));
    }
  });

  projectCommits.forEach(commit => {
    const category = categorizeCommit(commit, lang);
    const key = category.key;

    categorized[key] ??= {
      emoji: category.emoji,
      label: category.label,
      items: []
    };

    const files = fileCache.get(commit.hash);
    const { displayMsg, fileSummary } = formatCommitDisplay(commit, files, lang);

    categorized[key].items.push({
      date: commit.date,
      message: displayMsg,
      files: fileSummary,
      hash: commit.hash.substring(0, GIT_SHORT_HASH_LENGTH)
    });
  });

  return categorized;
}

/**
 * Generate statistics report for single project
 */
function generateProjectReport(projectName, categorized, t, order) {
  let output = '';

  // Project header
  output += `\n┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
  output += `┃ ${t.project}: ${projectName}\n`;
  output += `┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n`;

  // Calculate project total
  let projectTotal = 0;
  for (const cat of Object.values(categorized)) {
    projectTotal += cat.items.length;
  }

  output += `📊 ${t.project}${t.title}\n`;
  output += `📈 ${t.total}: ${projectTotal} ${t.items}\n\n`;

  // Output by category and date
  for (const key of order) {
    if (categorized[key]) {
      const cat = categorized[key];
      output += `${cat.emoji} ${cat.label} (${cat.items.length})\n`;

      // Group by date
      const itemsByDate = groupByDate(cat.items);

      // Output in date order
      Object.keys(itemsByDate).sort().reverse().forEach(date => {
        output += `  📅 ${date}\n`;
        itemsByDate[date].forEach((item, idx) => {
          output += `    ${idx + 1}. ${item.message}\n`;
          if (item.files) {
            output += `       📄 ${t.modifiedFiles}: ${item.files}\n`;
          }
        });
      });

      output += `\n`;
    }
  }

  output += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  return output;
}

/**
 * Generate summary report for all projects
 */
function generateSummaryReport(categorized, t, order, projectCount, user) {
  let output = '';

  // Summary header
  output += `\n┏━━━━━━━━━━━━ ${t.allProjects} ${t.title} ━━━━━━━━━━━━┓\n`;

  // Calculate total
  let totalCount = 0;
  for (const cat of Object.values(categorized)) {
    totalCount += cat.items.length;
  }

  output += `📊 ${t.title}\n`;
  output += `👤 ${t.user}: ${user}\n`;
  output += `📈 ${t.total}: ${totalCount} ${t.items} (${projectCount} ${t.project})\n`;
  output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

  // Only output category statistics, not detailed projects
  for (const key of order) {
    if (categorized[key]) {
      const cat = categorized[key];
      output += `${cat.emoji} ${cat.label} (${cat.items.length})\n`;
    }
  }

  output += `\n`;

  return output;
}

/**
 * Main function
 */
function main() {
  // Check help parameters
  if (process.argv.includes('-h') || process.argv.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  const args = {
    all: process.argv.includes('--all'),
    summary: process.argv.includes('--summary'),
    includeFiles: process.argv.includes('--include-files'),
    includeMerge: !process.argv.includes('--exclude-merge'), // Include merge by default, unless specified to exclude
    allProjects: process.argv.includes('--all-projects'),
    config: getArgValue('--config'),
    project: getArgValue('--project'),
    after: getArgValue('--after'),
    before: getArgValue('--before'),
    lang: getArgValue('--lang') || 'en',
    format: getArgValue('--format') || 'text'
  };

  // Validate language parameter
  if (!i18n[args.lang]) {
    console.error(`❌ Unsupported language: ${args.lang}, supported: zh, en`);
    process.exit(1);
  }

  const t = i18n[args.lang];

  // If no date is specified, default to today
  if (!args.all && !args.after && !args.before) {
    args.after = getTodayDate();
    args.before = getTodayDate();
  }

  // Validate time range
  if (!args.all) {
    validateTimeRange(args.after, args.before);
  }

  // Determine projects to scan
  let projectPaths = ['.'];
  if (args.config) {
    projectPaths = loadProjectsFromConfig(args.config);
    if (projectPaths.length === 0) {
      console.log(`\n❌ No projects in config file\n`);
      process.exit(1);
    }
  } else if (args.project) {
    projectPaths = [args.project];
  } else if (args.allProjects) {
    projectPaths = findAllProjects();
    if (projectPaths.length === 0) {
      console.log(`\n❌ No Git projects found\n`);
      process.exit(1);
    }
  }

  const currentUser = getCurrentUser();
  let allCommits = {};

  // Scan all projects
  for (const projectPath of projectPaths) {
    const projectName = path.basename(projectPath) || 'current';
    const commits = getCommits(args, projectPath, currentUser);
    if (commits.length > 0) {
      allCommits[projectName] = filterByCurrentUser(commits, currentUser, args.includeMerge);
    }
  }

  // Collect all commits
  let commits = [];
  for (const projectCommits of Object.values(allCommits)) {
    commits = commits.concat(projectCommits);
  }

  if (!commits.length) {
    const projectInfo = args.allProjects ? t.allProjects : 'This project';
    console.log(`\n📭 ${currentUser} ${t.noCommits}\n`);
    return;
  }

  // Define output order
  const order = ['fix', 'feat', 'docs', 'test', 'refactor', 'perf', 'style', 'ci', 'chore', 'merge', 'other'];

  // Check if --config parameter is used (multi-project mode)
  const isMultiProject = args.config && Object.keys(allCommits).length > 1;

  if (isMultiProject) {
    // Multi-project mode: output report for each project
    for (const [projectName, projectCommits] of Object.entries(allCommits)) {
      const projectCategorized = categorizeProjectCommits(projectCommits, args.lang);
      console.log(generateProjectReport(projectName, projectCategorized, t, order));
    }

    // Generate global classification for summary
    const globalCategorized = {};
    commits.forEach(commit => {
      const category = categorizeCommit(commit, args.lang);
      const key = category.key;

      if (!globalCategorized[key]) {
        globalCategorized[key] = {
          emoji: category.emoji,
          label: category.label,
          items: []
        };
      }

      globalCategorized[key].items.push({
        date: commit.date,
        message: commit.message,
        hash: commit.hash.substring(0, 7)
      });
    });

    // Output global summary
    console.log(generateSummaryReport(globalCategorized, t, order, Object.keys(allCommits).length, currentUser));

    // Handle format conversion
    if (args.format !== 'text') {
      console.log('='.repeat(60));
      console.log(`📋 ${args.format.toUpperCase()} format output`);
      console.log('='.repeat(60) + '\n');

      if (args.format === 'markdown') {
        console.log(convertToMarkdown(globalCategorized, t, order, currentUser, true, Object.keys(allCommits).length));
      } else {
        console.error(`❌ Unsupported format: ${args.format}, supported: text, markdown`);
      }
    }
  } else {
    // Single-project mode: use cached categorization
    // Pre-cache all file information to avoid N+1 git command issue
    const fileCache = new Map();
    commits.forEach(commit => {
      if (!fileCache.has(commit.hash)) {
        fileCache.set(commit.hash, getCommitFiles(commit.hash));
      }
    });

    const categorized = {};

    commits.forEach(commit => {
      const category = categorizeCommit(commit, args.lang);
      const key = category.key;

      categorized[key] ??= {
        emoji: category.emoji,
        label: category.label,
        items: []
      };

      const files = fileCache.get(commit.hash);
      const { displayMsg, fileSummary } = formatCommitDisplay(commit, files, args.lang);

      categorized[key].items.push({
        date: commit.date,
        message: displayMsg,
        files: fileSummary,
        hash: commit.hash.substring(0, GIT_SHORT_HASH_LENGTH)
      });
    });

    // Output report
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 ${t.title}`);
    console.log(`👤 ${t.user}: ${currentUser}`);
    if (args.allProjects) {
      console.log(`📁 ${t.project}: ${t.allProjects} (${Object.keys(allCommits).length} ${t.items})`);
    } else if (args.project) {
      console.log(`📁 ${t.project}: ${args.project}`);
    }
    console.log(`📈 ${t.total}: ${commits.length} ${t.items}`);
    console.log(`${'='.repeat(60)}\n`);

    // Output grouped by category and date
    for (const key of order) {
      if (categorized[key]) {
        const cat = categorized[key];
        console.log(`${cat.emoji} ${cat.label} (${cat.items.length})`);

        // Group by date
        const itemsByDate = groupByDate(cat.items);

        // Output in date order
        Object.keys(itemsByDate).sort().reverse().forEach(date => {
          console.log(`  📅 ${date}`);
          itemsByDate[date].forEach((item, idx) => {
            console.log(`    ${idx + 1}. ${item.message}`);
            if (item.files) {
              console.log(`       📄 ${t.modifiedFiles}: ${item.files}`);
            }
          });
        });

        console.log();
      }
    }

    console.log(`${'='.repeat(60)}\n`);

    // Handle format conversion
    if (args.format !== 'text') {
      console.log('\n' + '='.repeat(60));
      console.log(`📋 ${args.format.toUpperCase()} format output`);
      console.log('='.repeat(60) + '\n');

      if (args.format === 'markdown') {
        const isMulti = args.config && Object.keys(allCommits).length > 1;
        console.log(convertToMarkdown(categorized, t, order, currentUser, isMulti, Object.keys(allCommits).length));
      } else {
        console.error(`❌ Unsupported format: ${args.format}, supported: text, markdown`);
      }
    }
  }
}

main();
