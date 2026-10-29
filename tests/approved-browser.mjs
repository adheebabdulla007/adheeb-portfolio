import {chromium,firefox,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const base=process.env.QA_URL||'http://127.0.0.1:8777/';
const axe=await readFile(new URL('../node_modules/axe-core/axe.min.js',import.meta.url),'utf8');
await mkdir(new URL('../qa/',import.meta.url),{recursive:true});
const results=[];
for(const [engine,type] of Object.entries({chromium,firefox,webkit}).filter(([name])=>!process.env.QA_ENGINE || name===process.env.QA_ENGINE)){
 const browser=await type.launch();
 try{
  for(const width of [320,360,375,390,414,600,767,768,820,1024,1280,1440,1920,2560]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   const errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url())});
   try{
    await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('h1').count(),1);
    await page.locator('.hero-portrait img').evaluate(img=>img.decode());
    assert.ok(!(await page.locator('#home').innerText()).includes('130K'));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'initial overflow');
    if(engine==='chromium'&&[390,1440].includes(width)) await page.screenshot({path:`qa/hero-${width}.png`});
    await page.locator('.portrait-toggle').click();assert.ok(await page.locator('.portrait-context').isVisible());
    await page.keyboard.press('Escape');assert.equal(await page.locator('.portrait-context').isVisible(),false);
    if(width<768){await page.locator('.menu-button').click();await page.locator('#mobile-nav a[href="#projects"]').click();assert.equal(await page.locator('#mobile-nav').isVisible(),false);}
    assert.equal(await page.locator('.project:visible').count(),4);
    for(const id of ['erp','gcc','pursuit','research']){
     const box=await page.locator('#'+id).boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1,id+' offscreen');
     await page.locator('#'+id+'-details summary').press('Enter');assert.equal(await page.locator('#'+id+'-details').evaluate(e=>e.open),true);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'expanded '+id+' overflow');
     await page.locator('[data-close-project="'+id+'-details"]').click();
     assert.equal(await page.locator('#'+id+'-details').evaluate(e=>e.open),false);
     assert.equal(await page.locator('#'+id+'-details summary').evaluate(e=>e===document.activeElement),true);
    }
    const engineering=page.locator('.case-engineering');await engineering.locator('summary').press('Enter');
    assert.equal(await engineering.evaluate(e=>e.open),true);assert.ok(await page.locator('.validation-example').isVisible());
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'case detail overflow');
    await engineering.locator('summary').press('Enter');
    if(engine==='chromium'&&[390,1440].includes(width)){
     await page.screenshot({path:`qa/full-${width}.png`,fullPage:true});
    }
    for(const id of ['gcc-case-study','about','experience','toolkit','contact']){
     await page.locator('#'+id).scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+id);
    }
    await page.locator('.contact-compose > summary').press('Enter');
    await page.locator('.contact-form button[type=submit]').click();assert.equal(await page.locator('.contact-form').evaluate(f=>f.checkValidity()),false);
    await page.addScriptTag({content:axe});
    const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
    assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],'accessibility');
    assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
    results.push({engine,width,pass:true});console.log(engine,width,'PASS');
   }catch(error){results.push({engine,width,error:error.message});console.error(engine,width,error.message);}
   await page.close();
  }
  for(const mode of ['motion','no-js']){
   const page=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-js',reducedMotion:'no-preference'});
   try{
    await page.goto(base);await page.locator('#erp-details summary').click();assert.equal(await page.locator('#erp-details').evaluate(e=>e.open),true);
    await page.locator('.case-engineering summary').click();assert.ok(await page.locator('.validation-example').isVisible());
    assert.ok(await page.locator('.skill-groups').isVisible());
    if(mode==='no-js'){assert.equal(await page.locator('.contact-compose').isVisible(),false);assert.ok(await page.locator('.contact-email').isVisible());}
    results.push({engine,mode,pass:true});
   }catch(error){results.push({engine,mode,error:error.message});}
   await page.close();
  }
 }finally{await browser.close();}
}
await writeFile(new URL('../qa/approved-results.json',import.meta.url),JSON.stringify(results,null,2));
console.log(JSON.stringify({passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass)},null,2));
if(results.some(x=>!x.pass))process.exitCode=1;
