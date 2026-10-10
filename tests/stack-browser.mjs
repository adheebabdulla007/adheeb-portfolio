import { chromium, firefox, webkit } from 'playwright';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
const expectedHash='5a751aa3f34dbcec80103a72941fa2bf38739109b88a2cb3552181b4993945d2';
for(const [name,engine] of Object.entries({chromium,firefox,webkit})){
 const browser=await engine.launch();
 try {
 for(const width of [320,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.goto('http://127.0.0.1:8777/');
  assert.equal(await page.locator('#technology').count(),1,'Technology strip is available');
  await page.locator('#technology').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const track=page.locator('.tech-track');
  const before=await track.evaluate(el=>getComputedStyle(el).transform);
  await page.waitForTimeout(250);
  assert.notEqual(await track.evaluate(el=>getComputedStyle(el).transform),before,'Strip moves');
  await page.getByRole('button',{name:'Pause technology motion'}).click();
  const paused=await track.evaluate(el=>getComputedStyle(el).transform);
  await page.waitForTimeout(200);
  assert.equal(await track.evaluate(el=>getComputedStyle(el).transform),paused,'Pause stops motion');
  await page.getByRole('button',{name:'Resume technology motion'}).click();
  await page.waitForTimeout(200);
  assert.notEqual(await track.evaluate(el=>getComputedStyle(el).transform),paused,'Resume restarts motion');
  assert.ok(await page.locator('.tech-list img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0)),'Every logo decodes');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No overflow');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await track.evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.ok(await page.locator('.tech-list').first().evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Reduced motion exposes all items without clipping');
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('.resume-actions a[download]').click()]);
  assert.equal(download.suggestedFilename(),'AdheebAbdullaResume.pdf');
  assert.equal(createHash('sha256').update(await readFile(await download.path())).digest('hex'),expectedHash);
  const response=await page.request.get(new URL(await page.locator('.resume-actions a').first().getAttribute('href'),page.url()).href);
  assert.equal(response.headers()['content-type'],'application/pdf');
  assert.equal(createHash('sha256').update(await response.body()).digest('hex'),expectedHash);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('#technology').scrollIntoViewIfNeeded();
  if(name==='chromium')await page.screenshot({path:`qa/technology-${width}.png`});
  await page.close(); console.log(`${name} ${width}: motion, pause, reduced motion, logos, résumé passed`);
 }
 } finally {await browser.close();}
}
