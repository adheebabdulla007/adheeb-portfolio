import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../portfolio.js', import.meta.url), 'utf8');
test('interface icons cannot fall back to platform emoji glyphs', () => {
  assert.equal(/[↗↘↓↑←→＋×▦⇄⌘◉Ⅱ▶\uFE0F]/u.test(html + js), false);
});
test('tool categories expose readable native disclosure content', () => {
  for (const name of ['backend','interface','data','delivery','testing','research','ai']) {
    assert.match(html, new RegExp('<details[^>]*id="tools-' + name + '"'));
  }
  assert.equal(/class="(?:technology|stack-anchor)/.test(html), false);
});
test('capability destinations and close controls cover all four projects', () => {
  for (const name of ['erp','gcc','pursuit','research']) {
    assert.ok(html.includes('data-project-link="' + name + '"'));
    assert.ok(html.includes('data-close-project="' + name + '-details"'));
  }
});
