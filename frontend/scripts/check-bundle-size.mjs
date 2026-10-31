#!/usr/bin/env node
/**
 * Bundle Budget CI Gate
 *
 * Measures every JS chunk in dist/assets (gzipped) and fails the build if:
 *   - the entry chunk exceeds ENTRY_BUDGET_KB (keeps first paint fast), or
 *   - any single chunk exceeds CHUNK_BUDGET_KB, or
 *   - total JS exceeds TOTAL_BUDGET_KB.
 *
 * Budgets are deliberately set with modest headroom over current sizes.
 * Raise them intentionally (in a reviewed PR) when a feature justifies it.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const ENTRY_BUDGET_KB = 150;
const CHUNK_BUDGET_KB = 350;
const TOTAL_BUDGET_KB = 500;

const assetsDir = join(process.cwd(), 'dist', 'assets');
const indexHtml = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8');

const files = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
if (files.length === 0) {
  console.error('✖ No JS chunks found in dist/assets. Did the build run?');
  process.exit(1);
}

const kb = (bytes) => bytes / 1024;
let totalGzip = 0;
let failed = false;

console.log('\nBundle Budget Report (gzipped)\n');
console.log('Chunk'.padEnd(42) + 'Raw'.padStart(10) + 'Gzip'.padStart(10) + '  Limit');
console.log('-'.repeat(72));

for (const file of files.sort()) {
  const path = join(assetsDir, file);
  const raw = statSync(path).size;
  const gzip = gzipSync(readFileSync(path)).length;
  totalGzip += gzip;

  const isEntry = indexHtml.includes(file);
  const limit = isEntry ? ENTRY_BUDGET_KB : CHUNK_BUDGET_KB;
  const over = kb(gzip) > limit;
  if (over) failed = true;

  console.log(
    `${over ? '✖' : '✓'} ${(isEntry ? '[entry] ' : '') + file}`.padEnd(42) +
      `${kb(raw).toFixed(1)}kB`.padStart(10) +
      `${kb(gzip).toFixed(1)}kB`.padStart(10) +
      `  ${limit}kB`
  );
}

const totalOver = kb(totalGzip) > TOTAL_BUDGET_KB;
if (totalOver) failed = true;

console.log('-'.repeat(72));
console.log(
  `${totalOver ? '✖' : '✓'} Total JS`.padEnd(52) +
    `${kb(totalGzip).toFixed(1)}kB`.padStart(10) +
    `  ${TOTAL_BUDGET_KB}kB\n`
);

if (failed) {
  console.error('✖ Bundle budget exceeded. Code-split or justify a budget increase.\n');
  process.exit(1);
}
console.log('✓ All chunks within budget.\n');
