import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const captures = process.env.QA_SCREENSHOTS === '1';
if (captures) await mkdir(new URL('../qa/', import.meta.url), {recursive:true});
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: process.argv[2] || 'chrome', headless: true });
const results = [];
try {
  for (const [name, width, height, mobile] of [['desktop',1440,1000,false],['phone',390,844,true],['small-phone',320,640,true],['tablet',768,1024,true],['landscape-phone',812,375,true],['wide',1920,1080,false]]) {
    const context = await browser.newContext({ viewport:{width,height}, deviceScaleFactor: mobile ? 2 : 1, isMobile:mobile, hasTouch:mobile });
    const page = await context.newPage();
    console.log('Checking '+name);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const broken = [];
    page.on('response', response => { if (response.status() >= 400) broken.push(response.url()); });
    await page.addInitScript(() => {
      window.lab = {cls:0,lcp:0,longTasks:0};
      try { new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.lab.cls += e.value; })).observe({type:'layout-shift', buffered:true}); } catch {}
      try { new PerformanceObserver(list => list.getEntries().forEach(e => window.lab.lcp=e.startTime)).observe({type:'largest-contentful-paint', buffered:true}); } catch {}
      try { new PerformanceObserver(list => window.lab.longTasks += list.getEntries().length).observe({type:'longtask', buffered:true}); } catch {}
    });
    await page.goto('http://127.0.0.1:8766/', {waitUntil:'networkidle'});
    await page.locator('.portrait-frame img').evaluate(img => img.decode());
    const geometry = await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,mode:document.documentElement.dataset.motion,image:document.querySelector('.portrait-frame img').currentSrc,offenders:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0 && r.right>innerWidth+2 && getComputedStyle(e).position!=='absolute';}).slice(0,8).map(e=>e.className)}));
    assert.ok(geometry.scroll <= width+1, name+': horizontal overflow '+JSON.stringify(geometry));
    if (captures && (name==='desktop'||name==='phone')) await page.screenshot({path:new URL('../qa/atlas-'+name+'.png',import.meta.url).pathname.replace(/^\//,'')});
    await page.locator('[data-erp="1"]').click();
    assert.equal(await page.locator('[data-erp="1"]').getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('#erp-reading').textContent(),/invoice records/);
    const path14 = page.getByRole('button',{name:'Open illustrative path 14',exact:true});
    await path14.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
    await path14.click();
    assert.match(await page.locator('#load-status').textContent(),/Path 14 selected/);
    if (captures && (name==='desktop'||name==='phone')) await page.locator('#erp').screenshot({path:new URL('../qa/atlas-'+name+'-erp.png',import.meta.url).pathname.replace(/^\//,'')});
    await page.locator('[data-proof="rotation"]').click();
    assert.equal(await page.locator('#rotation-proof').isVisible(),true);
    assert.equal(await page.locator('#tenant-proof').isVisible(),false);
    assert.match(await page.locator('#proof-source-link').getAttribute('href'),/AuthRefreshTokenTests/);
    await page.locator('[data-proof="tenant"]').click();
    await page.locator('#trace-request').click();
    await page.waitForFunction(()=>!document.querySelector('#trace-request').disabled);
    assert.equal(await page.locator('.trace-active').count(),5);
    if (captures && (name==='desktop'||name==='phone')) await page.locator('#pursuit').screenshot({path:new URL('../qa/atlas-'+name+'-pursuit.png',import.meta.url).pathname.replace(/^\//,'')});
    await page.locator('[data-voice="transcript"]').click();
    assert.equal(await page.locator('#transcript-panel').isVisible(),true);
    assert.equal(await page.locator('#speech-panel').isVisible(),false);
    await page.locator('[data-voice="svm"]').click();
    assert.equal(await page.locator('#svm-panel').isVisible(),true);
    if (captures && (name==='desktop'||name==='phone')) {
      for (const section of ['ownership','ai','atlas']) {
        await page.locator('#'+section).scrollIntoViewIfNeeded();
        await page.locator('#'+section).screenshot({path:new URL('../qa/atlas-'+name+'-'+section+'.png',import.meta.url).pathname.replace(/^\//,''),animations:'disabled'});
      }
    }
    await page.locator('[data-dialog="message-dialog"]').click();
    assert.equal(await page.locator('#message-dialog').isVisible(),true);
    await page.locator('#contact-name').fill(' ');
    await page.locator('#contact-message').fill(' ');
    await page.locator('#copy-draft').click();
    assert.equal(await page.locator('#contact-name').evaluate(e=>e.validity.valid),false);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#message-dialog').isVisible(),false);
    assert.equal(await page.locator('[data-dialog="message-dialog"]').evaluate(e=>e===document.activeElement),true);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>document.documentElement.dataset.motion==='reduced');
    assert.equal(await page.locator('html').getAttribute('data-motion'),'reduced');
    await page.locator('#trace-request').click();
    assert.equal(await page.locator('.trace-active').count(),5);
    assert.equal(await page.locator('#trace-request').isDisabled(),false);
    assert.equal(errors.length,0,name+': '+errors.join(';'));
    assert.equal(broken.length,0,name+': missing assets '+broken.join(';'));
    results.push({name,...geometry,lab:await page.evaluate(()=>window.lab),interactions:'passed',errors});
    await context.close();
  }
  console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
