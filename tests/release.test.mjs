import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),html=await readFile(new URL('index.html',root),'utf8');
test('every internal link has one destination and IDs are unique',()=>{const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);for(const [,target] of html.matchAll(/href="#([^"]+)"/g))assert.equal(ids.filter(id=>id===target).length,1,target)});
test('local links and assets exist with nonzero length',async()=>{for(const [,target]of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^(https?:|mailto:|tel:)/.test(target))continue;assert.ok((await stat(new URL(target,root))).size>0,target)}});
test('public source links exclude private repositories and placeholder URLs',()=>{assert.ok(!html.includes('href="#"'));assert.ok(!html.includes('github.com/adheebabdulla007/pursuit'));assert.ok(!/href="(?:javascript:|https:\/\/example)/.test(html));assert.equal((html.match(/<h1\b/g)||[]).length,1)});
test('contact actions retain correct destinations',()=>{for(const url of ['mailto:adheebabdullavp@gmail.com','tel:+919400727023','https://wa.me/919400727023','https://www.linkedin.com/in/adheeb-abdullavp/','https://github.com/adheebabdulla007'])assert.ok(html.includes('href="'+url+'"'),url)});
test('production output contains only release assets',async()=>{const files=await readdir(new URL('dist/',root));assert.ok(!files.some(f=>/cinema|node_modules|test|\.env|README/.test(f)));assert.ok(files.includes('404.html'));assert.ok((await stat(new URL('dist/portfolio.js',root))).size<15000)});
