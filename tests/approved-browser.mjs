import {chromium, firefox, webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
const base = process.env.QA_URL || 'http://127.0.0.1:8777/';
const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js',import.meta.url),'utf8');
const results = [];
await mkdir(new URL('../qa/',import.meta.url),{recursive:true});
for (const [engine, type] of Object.entries({chromium,firefox,webkit})) {
  const browser = await type.launch();
  try {
    for (const width of [320,390,768,1440,1920]) {
      const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      const page = await context.newPage();
      const errors=[],bad=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.status()>=400)bad.push(r.url())});
      try {
        await page.goto(base,{waitUntil:'networkidle'});
        await page.evaluate(()=>document.fonts.ready);
        assert.equal(await page.locator('h1').count(),1);
        await page.locator('.hero-portrait img').evaluate(img=>img.decode());
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
        if(width<768){
          await page.locator('.menu-button').click();
          await page.locator('#mobile-nav a[href="#projects"]').click();
          assert.equal(await page.locator('#mobile-nav').isVisible(),false);
        }
        await page.locator('[data-filter="research"]').click();
        assert.equal(await page.locator('.project:visible').count(),1);
        assert.equal(await page.locator('.project:visible').getAttribute('id'),'research');
        await page.locator('#research-details summary').click();
        assert.equal(await page.locator('#research-details').evaluate(e=>e.open),true);
        await page.locator('[data-filter="all"]').click();
        assert.equal(await page.locator('.project:visible').count(),4);
        await page.locator('.portrait-toggle').click();
        assert.ok(await page.locator('.portrait-context').isVisible());
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.portrait-context').isVisible(),false);
        await page.locator('.trophy-toggle').click();
        assert.equal(await page.locator('.trophy-toggle').getAttribute('aria-pressed'),'true');
        await page.locator('.trophy-toggle').press('Enter');
        assert.equal(await page.locator('.trophy-toggle').getAttribute('aria-pressed'),'false');
        await page.locator('[data-project-link="gcc"]').click();
        assert.equal(await page.locator('#gcc-details').evaluate(e=>e.open),true);
        await page.locator('[data-close-project="gcc-details"]').click();
        assert.equal(await page.locator('#gcc-details').evaluate(e=>e.open),false);
        assert.equal(await page.locator('#gcc-details summary').evaluate(e=>e===document.activeElement),true);
        await page.locator('.experience-list details').nth(1).locator('summary').click();
        await page.waitForFunction(()=>document.querySelectorAll('.experience-route li')[1].getAttribute('aria-current')==='step');
        for(const name of ['interface','data','delivery','testing','research','backend']){
          await page.locator(width<768?'#tools-'+name+' summary':'[data-tool="'+name+'"]').click();
          assert.equal(await page.locator('#tools-'+name).evaluate(e=>e.open),true);
          assert.equal(await page.locator('.tool-category[open]').count(),1);
          assert.ok(await page.locator('#tools-'+name+' .tool-panel').isVisible());
        }
        assert.equal(/[↗↘↓↑←→＋×▦⇄⌘◉Ⅱ▶\uFE0F]/u.test(await page.locator('body').innerText()),false);
        assert.ok(await page.locator('.header-email svg').count());
        for(const id of ['about','experience','toolkit','contact']){
          await page.locator('#'+id).scrollIntoViewIfNeeded();
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+id);
        }
        await page.locator('.contact-form button').click();
        assert.equal(await page.locator('.contact-form').evaluate(f=>f.checkValidity()),false);
        await page.addScriptTag({content:axe});
        const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
        assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],'accessibility');
        const resume=await page.request.get(new URL('assets/AdheebResume.pdf',base).href);
        assert.equal(resume.status(),200);
        assert.equal((await resume.body()).subarray(0,4).toString(),'%PDF');
        assert.deepEqual(errors,[]);
        assert.deepEqual(bad,[]);
        results.push({engine,width,pass:true});
        console.log(engine,width,'PASS');
      } catch(error){results.push({engine,width,error:error.message});console.error(engine,width,error.message);}
      await context.close();
    }
    for(const mode of ['motion','no-js']){
      const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-js',reducedMotion:'no-preference'});
      const page=await context.newPage();
      try{
        await page.goto(base);
        if(mode==='motion'){
          await page.locator('#tools-testing summary').click();
          assert.ok(await page.locator('#tools-testing .tool-panel').isVisible());
          await page.locator('#tools-testing summary').press('Enter');
          assert.equal(await page.locator('#tools-testing').evaluate(e=>e.open),false);
        }else{
          await page.locator('#erp-details summary').click();
          assert.equal(await page.locator('#erp-details').evaluate(e=>e.open),true);
          assert.ok(await page.locator('.about-story').isVisible());
          await page.locator('#tools-data summary').click();
          assert.ok(await page.locator('#tools-data .tool-panel').isVisible());
        }
        results.push({engine,mode,pass:true});
      }catch(error){results.push({engine,mode,error:error.message});}
      await context.close();
    }
  } finally {await browser.close();}
}
await writeFile(new URL('../qa/approved-results.json',import.meta.url),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
if(results.some(r=>!r.pass))process.exitCode=1;
