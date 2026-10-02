import { mkdir, readFile, copyFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const files = ['index.html', 'cinema.css', 'evidence.css', 'cinema.js', 'assets/adheeb-studio.webp', 'assets/trophy.webp', 'assets/AdheebResume.pdf'];
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML ids');
for (const [, hash] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.includes(hash)) throw new Error(`Missing anchor target: ${hash}`);
}
for (const [, target] of html.matchAll(/data-dialog="([^"]+)"/g)) {
  if (!ids.includes(target)) throw new Error(`Missing dialog: ${target}`);
}
for (const [, asset] of html.matchAll(/(?:src|href)="((?:assets\/|cinema\.)[^"]+)"/g)) {
  if (!files.includes(asset.split('?')[0])) throw new Error(`Unlisted public asset: ${asset}`);
}
async function checkExisting(dir, relative = '') {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  for (const entry of entries) {
    const name = relative + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink in output: ${name}`);
    if (entry.isDirectory()) {
      if (name !== 'assets') throw new Error(`Unexpected directory in output: ${name}`);
      await checkExisting(path.join(dir, entry.name), name + '/');
    } else if (!files.includes(name)) throw new Error(`Archive obsolete output before rebuilding: ${name}`);
  }
}
await checkExisting(output);
await mkdir(path.join(output, 'assets'), { recursive: true });
let bytes = 0;
for (const file of files) {
  const source = path.join(root, file);
  bytes += (await stat(source)).size;
  await copyFile(source, path.join(output, file));
}
console.log(`Built ${files.length} public files (${(bytes / 1024).toFixed(0)} KiB, including résumé). Internal links and asset allowlist verified.`);
