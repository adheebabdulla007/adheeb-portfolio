import { mkdir, readFile, copyFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const files = ['index.html', '404.html', 'refinements.css', 'portfolio.css', 'portfolio.js', 'assets/Adheeb.Photo.jpeg', 'assets/trophy.webp', 'assets/AdheebResume.pdf', 'assets/icon.svg', 'assets/manrope-400.ttf', 'assets/manrope-600.ttf', 'assets/spacegrotesk-500.ttf', 'assets/spacegrotesk-600.ttf', 'assets/manrope-OFL.txt', 'assets/spacegrotesk-OFL.txt', 'assets/devicon-LICENSE.txt', 'assets/tech-csharp.svg', 'assets/tech-dotnetcore.svg', 'assets/tech-entityframeworkcore.svg', 'assets/tech-microsoftsqlserver.svg', 'assets/tech-redis.svg', 'assets/tech-rabbitmq.svg', 'assets/tech-react.svg', 'assets/tech-typescript.svg', 'assets/tech-tailwindcss.svg', 'assets/tech-vite.svg', 'assets/tech-docker.svg', 'assets/tech-azure.svg', 'assets/tech-githubactions.svg', 'assets/tech-vitest.svg', 'assets/tech-playwright.svg', 'assets/tech-huggingface.svg', 'assets/tech-retell.svg', 'assets/tech-codex.svg', 'assets/tech-claude.svg', 'assets/tech-grok.svg', 'assets/ai-logos-NOTICE.txt'];
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML ids');
for (const [, hash] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.includes(hash)) throw new Error(`Missing anchor target: ${hash}`);
}
for (const [, target] of html.matchAll(/data-open="([^"]+)"/g)) {
  if (!ids.includes(target)) throw new Error(`Missing disclosure: ${target}`);
}
for (const [, asset] of html.matchAll(/(?:src|href)="((?:assets\/|portfolio\.|design-tokens\.)[^"]+)"/g)) {
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
