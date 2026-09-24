// The service worker precaches the app shell by hand. A module that is not on
// that list loads fine online and fails the moment you are in a basement gym
// with no signal, which is exactly when this app has to work.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.js')) out.push(full);
  }
  return out;
}

const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const shell = new Set(
  [...sw.matchAll(/'(\.\/[^']+)'/g)].map((m) => m[1].replace(/^\.\//, '')),
);

test('every javascript module is in the offline shell', () => {
  const missing = walk(join(ROOT, 'js'))
    .map((f) => relative(ROOT, f))
    .filter((f) => !shell.has(f));
  assert.deepEqual(missing, [], `not precached: ${missing.join(', ')}`);
});

test('the shell does not list files that no longer exist', () => {
  const stale = [...shell]
    .filter((f) => f.endsWith('.js'))
    .filter((f) => {
      try { statSync(join(ROOT, f)); return false; } catch { return true; }
    });
  assert.deepEqual(stale, [], `listed but gone: ${stale.join(', ')}`);
});

test('the cache version was bumped alongside the shell', () => {
  // a new file in an old cache name is never fetched by returning visitors
  const version = sw.match(/const VERSION = '([^']+)'/);
  assert.ok(version, 'no VERSION in sw.js');
  assert.match(version[1], /^v\d+\.\d+\.\d+$/, 'version should look like v1.2.3');
});
