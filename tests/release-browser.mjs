import {chromium,firefox,webkit} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.QA_URL||'http://127.0.0.1:8777/';
const axe=await readFile(new URL('../node_modules/axe-core/axe.min.js',import.meta.url),'utf8');
await mkdir(new URL('../qa/',import.meta.url),{recursive:true});
const results=[],failures=[];
const variants=[['small',320,640],['phone',390,844],['large-phone',430,932],['tablet',768,1024],['landscape',812,375],['laptop',1366,768],['desktop',1440,1000],['wide',1920,1080],['ultrawide',2560,1440]];
for(const [engine,type]of Object.entries({chromium,firefox,webkit})){
 let browser;try{browser=await type.launch({headless:true});}catch(e){failures.push({engine,error:e.message});continue;}
 try{
  for(const [name,width,height]of variants){
   const context=await browser.newContext({viewport:{width,height},hasTouch:width<1024,deviceScaleFactor:width<768?2:1});
   const page=await context.newPage(),errors=[],bad=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push({url:r.url(),status:r.status()})});
   try{
    await page.addInitScript(()=>{window.lab={cls:0,lcp:0,longTasks:0};try{new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.lab.cls+=e.value})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>window.lab.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>window.lab.longTasks+=l.getEntries().length).observe({type:'longtask',buffered:true});}catch{}});
    await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
    await page.locator('.portrait img').evaluate(img=>img.decode());
    assert.equal(await page.locator('h1').count(),1);
    const initial=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,lab:window.lab}));
    assert.ok(initial.scroll<=width+1,'horizontal overflow '+initial.scroll);
    if(engine==='chromium'&&['phone','desktop'].includes(name))await page.screenshot({path:new URL('../qa/'+name+'-hero.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
    if(width<768){await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.locator('#mobile-menu a[href="#work"]').click();await page.waitForFunction(()=>location.hash==='#work');assert.equal(await page.locator('#mobile-menu').isVisible(),false);await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));}
    for(const id of ['about','work','erp','gcc','pursuit','ai','contact']){
      await page.evaluate(id=>{location.hash=id;document.getElementById(id).scrollIntoView({behavior:'instant'});},id);
      await page.waitForTimeout(70);
      assert.equal(await page.locator('#'+id).count(),1);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow at '+id);
    }
    for(const key of ['erp','gcc','pursuit','ai']){
      const button=page.locator('[data-case="'+key+'"]');await page.locator('.work-index a[href="#'+key+'"]').evaluate(a=>a.click());await page.waitForTimeout(900);await button.click({timeout:5000});
      assert.ok(await page.locator('#case-dialog').isVisible());assert.ok((await page.locator('#case-content').innerText()).length>150);
      await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.activeElement===document.body||document.querySelector('#case-dialog').contains(document.activeElement)),'modal must not focus underlying page');
      if(key==='erp'){await page.addScriptTag({content:axe});const a=await page.evaluate(()=>axe.run(document.querySelector('#case-dialog'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));assert.deepEqual(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],'dialog accessibility');}
      await page.keyboard.press('Escape');assert.equal(await page.locator('#case-dialog').isVisible(),false);assert.ok(await button.evaluate(b=>document.activeElement===b),'focus restore');
    }
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.addScriptTag({content:axe});
    const a=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
    assert.deepEqual(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],'page accessibility');
    const portraitState=await page.evaluate(()=>{const s=document.querySelector('.portrait-story');window.scrollTo({top:s.offsetTop+s.offsetHeight-innerHeight,behavior:'instant'});return s.offsetHeight});
    await page.waitForTimeout(100);
    assert.ok(Number(await page.locator('.about-copy').evaluate(e=>getComputedStyle(e).opacity))>.99,'biography visible');
    if(engine==='chromium'&&['phone','desktop'].includes(name)){await page.screenshot({path:new URL('../qa/'+name+'-portrait.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});await page.locator('#erp').scrollIntoViewIfNeeded();await page.screenshot({path:new URL('../qa/'+name+'-erp.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});}
    assert.deepEqual(errors,[],'browser errors');assert.deepEqual(bad,[],'failed asset requests');
    const resume=await page.request.get(new URL('assets/AdheebResume.pdf',base).href);assert.equal(resume.status(),200);assert.ok(resume.headers()['content-type'].includes('application/pdf'));assert.ok((await resume.body()).subarray(0,4).toString()==='%PDF');
    results.push({engine,name,width,height,pass:true,lab:initial.lab,portraitState});console.log(engine+' '+name+' PASS');
   }catch(e){failures.push({engine,name,error:e.message});console.error(engine+' '+name+' FAIL '+e.message);}
   await context.close();
  }
  for(const mode of ['reduced','no-js']){
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'}),page=await context.newPage();
   try{await page.goto(base);assert.equal(await page.locator('.about-copy').evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await page.locator('.project').first().evaluate(e=>getComputedStyle(e).position),'relative');results.push({engine,mode,pass:true});}catch(e){failures.push({engine,mode,error:e.message});}await context.close();
  }
 }finally{await browser.close();}
}
await writeFile(new URL('../qa/results.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),results,failures},null,2));
console.log(JSON.stringify({passed:results.length,failures},null,2));if(failures.length)process.exitCode=1;
