import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../portfolio.js', import.meta.url), 'utf8');
test('interface icons cannot fall back to platform emoji glyphs', () => {
  assert.equal(/[↗↘↓↑←→＋×▦⇄⌘◉Ⅱ▶\uFE0F]/u.test(html + js), false);
});
test('capability destinations and close controls cover all four projects', () => {
  for (const name of ['erp','gcc','pursuit','research']) {
    if(name!=='research') assert.ok(html.includes('data-project-link="' + name + '"'));
    assert.ok(html.includes('data-close-project="' + name + '-details"'));
  }
});
