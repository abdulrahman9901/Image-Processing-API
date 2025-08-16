const fs = require('fs');
const path = require('path');

const INPUT_JSON = path.resolve('/workspace/github_analysis/repos.json');
const OUT_DIR = path.resolve('/workspace/github_analysis');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function toCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = Array.isArray(val) ? val.join(';') : String(val);
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

function categorizeRepo(name, description, topics) {
  const text = `${name} ${description || ''} ${(topics || []).join(' ')}`.toLowerCase();
  const categories = [];

  const addIf = (cond, cat) => {
    if (cond) categories.push(cat);
  };

  addIf(/embedded|stm32|arm|microwave|motor|edf|scheduler|automotive/.test(text), 'Embedded Systems');
  addIf(/compiler|assembler|translator|nand2tetris|vm|hack-assembler|hack-compiler/.test(text), 'Compilers/Systems');
  addIf(/leetcode|algorithms|data-structures|dsa/.test(text), 'Algorithms/DSA');
  addIf(/express|node|api|backend|storefront/.test(text), 'Web Backend');
  addIf(/react|next|frontend|component|todo|countries|tindog|myreads|would-you-rather|webpack/.test(text), 'Web Frontend/React');
  addIf(/full-stack|hosting/.test(text), 'Full-Stack');
  addIf(/django|ruby|rails/.test(text), 'Other Web Frameworks');
  addIf(/opencv|self-driving|runway|cv|computer vision|tracker/.test(text), 'Computer Vision/ML');
  addIf(/concurrent|traffic|cpp|c\+\+|system monitor|route planner|memory management/.test(text), 'C++/Systems');
  addIf(/chat|socket|realtime/.test(text), 'Realtime/Networking');
  addIf(/game|snake|drum|rock-?paper-?scissors/.test(text), 'Games/Interactive');
  addIf(/starter|boilerplate|utils|downloader/.test(text), 'Utilities/Starters');
  addIf(/course|forage|specialization|learning/.test(text), 'Coursework/Certs');

  if (categories.length === 0) categories.push('Misc');
  return Array.from(new Set(categories));
}

function main() {
  ensureDir(OUT_DIR);
  const repos = readJson(INPUT_JSON);

  const summarized = repos.map((r) => {
    const summary = {
      id: r.id,
      full_name: r.full_name,
      name: r.name,
      description: r.description,
      predominant_language: r.language,
      topics: r.topics || [],
      stars: r.stargazers_count,
      forks: r.forks_count,
      open_issues: r.open_issues_count,
      watchers: r.watchers_count,
      default_branch: r.default_branch,
      size_kb: r.size,
      created_at: r.created_at,
      updated_at: r.updated_at,
      pushed_at: r.pushed_at,
      license: (r.license && (r.license.spdx_id || r.license.name)) || null,
      homepage: r.homepage || null,
      archived: r.archived,
      disabled: r.disabled,
      visibility: r.visibility || (r.private ? 'private' : 'public')
    };
    summary.categories = categorizeRepo(summary.name, summary.description, summary.topics);
    return summary;
  });

  // Compute aggregates
  const languageCounts = {};
  const topicCounts = {};
  const categoryCounts = {};

  for (const r of summarized) {
    if (r.predominant_language) {
      languageCounts[r.predominant_language] = (languageCounts[r.predominant_language] || 0) + 1;
    }
    for (const t of r.topics) {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }
    for (const c of r.categories) {
      categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    }
  }

  const sortEntries = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

  const themes = {
    total_repos: summarized.length,
    languages: sortEntries(languageCounts),
    topics: sortEntries(topicCounts),
    categories: sortEntries(categoryCounts)
  };

  // Output JSON
  writeJson(path.join(OUT_DIR, 'repos_summary.json'), summarized);
  writeJson(path.join(OUT_DIR, 'themes.json'), themes);

  // Output CSV
  const csvRows = summarized.map((r) => ({
    full_name: r.full_name,
    description: r.description,
    predominant_language: r.predominant_language,
    topics: (r.topics || []).join(';'),
    stars: r.stars,
    forks: r.forks,
    open_issues: r.open_issues,
    watchers: r.watchers,
    size_kb: r.size_kb,
    created_at: r.created_at,
    updated_at: r.updated_at,
    pushed_at: r.pushed_at,
    license: r.license,
    categories: r.categories.join(';')
  }));
  const csv = toCsv(csvRows);
  fs.writeFileSync(path.join(OUT_DIR, 'repos_summary.csv'), csv, 'utf-8');

  // Create a quick top-10 list for candidate deep dives
  const candidates = [...summarized]
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 12)
    .map((r) => ({
      name: r.name,
      full_name: r.full_name,
      updated_at: r.updated_at,
      predominant_language: r.predominant_language,
      stars: r.stars,
      categories: r.categories
    }));

  writeJson(path.join(OUT_DIR, 'top_candidates.json'), candidates);

  console.log(`Analyzed ${summarized.length} repos.`);
  console.log('Top languages:', themes.languages.slice(0, 5));
  console.log('Top categories:', themes.categories.slice(0, 5));
}

main();