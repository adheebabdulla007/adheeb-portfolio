import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../cinema.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../cinema.css', import.meta.url), 'utf8');

test('requested chapter order is preserved', () => {
  const positions = ['erp', 'ownership', 'pursuit', 'ai'].map(id => html.indexOf('id="' + id + '"'));
  assert.ok(positions.every((position, i) => position > -1 && (i === 0 || position > positions[i - 1])));
});
test('eight-request diagrams contain eight marks', () => {
  const diagrams = [...html.matchAll(/class="eight-dots"[^>]*>(.*?)<\/div>/gs)];
  assert.ok(diagrams.length > 0);
  for (const [, content] of diagrams) assert.equal((content.match(/<i>/g) || []).length, 8);
});
test('no UI screenshots or original photographs enter the page', () => {
  assert.doesNotMatch(html, /pursuit-home|product-preview|adheeb-photo|WhatsApp Image/);
});
test('GitHub evidence is pinned and CI is dated', () => {
  assert.doesNotMatch(html, /pursuit\/blob\/main\//);
  assert.match(html, /5a6c4139adac69606f55811e3430d034b4234c73/);
  assert.match(html, /1 Oct 2026/);
  assert.match(html, /36817898440/);
});
test('motion respects native scroll and user preferences', () => {
  assert.doesNotMatch(js, /addEventListener\(['"](?:wheel|touchmove|scroll)['"]/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\[hidden\]\{display:none!important\}/);
});
test('new-tab links prevent opener access', () => {
  for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(tag, /rel="[^"]*noopener/);
});
test('images have dimensions and alternative text', () => {
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(tag, /alt="[^"]+"/);
    assert.match(tag, /width="\d+"/);
    assert.match(tag, /height="\d+"/);
  }
});
test('JavaScript files are local, external trackers absent', () => {
  for (const [, src] of html.matchAll(/<script[^>]+src="([^"]+)"/g)) assert.ok(!src.includes('://'));
  assert.doesNotMatch(js, /localStorage|document\.cookie|fetch\(/);
});
