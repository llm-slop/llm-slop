// Reports how each commit in a range declares its authorship, and whether the
// pull request description agrees with the commits underneath it.
//
// Merge commits are skipped: a merge is not authored prose, and on a pull
// request the checkout's own merge commit would otherwise report as human and
// make every branch read as mixed.
//
// A commit is machine-authored when it carries the trailers
//
//     Slop-Provenance: machine
//     Slop-Sample: <a line from the SIGNATURES list in AGENTS.md>
//
// and human-authored when it carries neither. Anything in between is a
// discrepancy: the mark is only worth having while it is accurate, so a
// half-applied one gets reported.
//
//   node tools/provenance.mjs                     # origin/main..HEAD
//   node tools/provenance.mjs main..HEAD
//   node tools/provenance.mjs --summary           # also write a job summary
//   node tools/provenance.mjs --pr-body body.md
//   node tools/provenance.mjs --strict            # exit 1 on a discrepancy
//
// No dependencies. The site has none and neither does this.

import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const bodyIndex = argv.indexOf('--pr-body');
const bodyPath = bodyIndex === -1 ? null : argv[bodyIndex + 1];
const valueIndex = bodyIndex === -1 ? -1 : bodyIndex + 1;
const positional = argv.filter((a, i) => !a.startsWith('--') && i !== valueIndex);
const range = positional[0] ?? 'origin/main..HEAD';

const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trimEnd();

// The canon lives in the provenance block in AGENTS.md, so there is one copy of
// it and the file an agent reads is the file this checks against.
function signatures() {
  const agents = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  const block = agents.match(/slop-provenance:begin([\s\S]*?)slop-provenance:end/);
  if (!block) return [];
  const list = block[1].split(/^SIGNATURES$/m)[1] ?? '';
  return list
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());
}

function trailer(message, key) {
  const match = message.match(new RegExp(`^${key}:[ \\t]*(.+)$`, 'mi'));
  return match ? match[1].trim() : null;
}

function commits(revs) {
  const RECORD = '\x1e';
  const FIELD = '\x1f';
  let log;
  try {
    log = git([
      'log',
      '--reverse',
      '--no-merges',
      `--format=%h${FIELD}%an${FIELD}%s${FIELD}%B${RECORD}`,
      revs,
    ]);
  } catch {
    console.error(`cannot read range: ${revs}`);
    process.exit(2);
  }
  return log
    .split(RECORD)
    .map((record) => record.replace(/^\n+/, ''))
    .filter((record) => record.trim())
    .map((record) => {
      const [sha, author, subject, message] = record.split(FIELD);
      return { sha, author, subject, message };
    });
}

const canon = signatures();

function classify(commit) {
  const declared = trailer(commit.message, 'Slop-Provenance');
  const sample = trailer(commit.message, 'Slop-Sample');
  if (!declared && !sample) return { verdict: 'human', note: '' };
  if (declared !== 'machine') {
    return { verdict: 'unclear', note: `Slop-Provenance: ${declared ?? 'missing'}` };
  }
  if (!sample) return { verdict: 'machine', note: 'no sample' };
  if (canon.length && !canon.includes(sample)) {
    return { verdict: 'machine', note: 'sample is not in the canon' };
  }
  return { verdict: 'machine', note: '' };
}

const rows = commits(range).map((commit) => ({ ...commit, ...classify(commit) }));

let bodyNote = null;
if (bodyPath) {
  let body = '';
  try {
    body = readFileSync(bodyPath, 'utf8');
  } catch {
    body = '';
  }
  const marked = /^\s*\*\*Provenance:\*\*\s*machine-authored/im.test(body);
  const machine = rows.some((row) => row.verdict === 'machine');
  if (body.trim() === '') bodyNote = null;
  else if (machine && !marked) bodyNote = 'the commits are machine-authored, the description is not marked';
  else if (!machine && marked) bodyNote = 'the description is marked, the commits are not';
}

const counts = rows.reduce((acc, row) => {
  acc[row.verdict] = (acc[row.verdict] ?? 0) + 1;
  return acc;
}, {});

const verdict = (() => {
  if (rows.length === 0) return 'no commits in range';
  if (counts.unclear) return 'discrepancy';
  if (counts.machine && counts.human) return 'mixed: machine and human commits';
  if (counts.machine) return 'machine-authored';
  return 'human-authored';
})();

const discrepancies = rows.filter((row) => row.note).length + (bodyNote ? 1 : 0);

console.log(`range: ${range}`);
for (const row of rows) {
  const note = row.note ? `  (${row.note})` : '';
  console.log(`${row.sha}  ${row.verdict.padEnd(7)}  ${row.author.padEnd(18)}  ${row.subject}${note}`);
}
console.log(`verdict: ${verdict}`);
if (bodyNote) console.log(`description: ${bodyNote}`);

if (flags.has('--summary') && process.env.GITHUB_STEP_SUMMARY) {
  const escape = (text) => String(text).replace(/\|/g, '\\|');
  const lines = [
    '## Provenance',
    '',
    `**${verdict}** — ${rows.length} commit${rows.length === 1 ? '' : 's'} in \`${range}\`.`,
    '',
    '| Commit | Authorship | Author | Subject |',
    '| --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| \`${row.sha}\` | ${row.verdict}${row.note ? ` (${escape(row.note)})` : ''} | ${escape(row.author)} | ${escape(row.subject)} |`,
    ),
  ];
  if (bodyNote) lines.push('', `Description: ${bodyNote}.`);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
}

if (flags.has('--strict') && discrepancies > 0) process.exit(1);
