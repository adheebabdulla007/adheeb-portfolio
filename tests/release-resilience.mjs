import { chromium } from 'playwright';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true}),result={};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://127.0.0.1:8777/',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 result.scroll=await page.evaluate(async()=>{
  const frames=[];let last=performance.now(),longTasks=0;const observer=new PerformanceObserver(l=>longTasks+=l.getEntries().length);observer.observe({type:'longtask'});
  const max=document.documentElement.scrollHeight-innerHeight;
  for(let i=0;i<360;i++){await new Promise(resolve=>requestAnimationFrame(t=>{frames.push(t-last);last=t;window.scrollTo({top:max*i/359,behavior:'instant'});resolve()}));}
  observer.disconnect();const sorted=frames.slice(5).sort((a,b)=>a-b);
  return {samples:sorted.length,medianMs:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:Math.max(...sorted),over34ms:sorted.filter(x=>x>34).length,longTasks};
 });
 await page.goto('http://127.0.0.1:8777/#pursuit',{waitUntil:'networkidle'});
 await page.waitForTimeout(250);await page.locator('[data-case="pursuit"]').click({timeout:5000});assert.ok(await page.locator('#case-dialog').isVisible());await page.keyboard.press('Escape');result.directHash=true;
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.setViewportSize({width:720,height:900});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% text overflow');result.largeText=true;
 await page.goto('http://127.0.0.1:8777/404.html');await page.locator('#home').click();assert.ok((await page.title()).includes('Software Engineer'));result.notFoundHome=true;
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8777/',{waitUntil:'networkidle'});
 await page.context().setOffline(true);await page.locator('[data-case="gcc"]').scrollIntoViewIfNeeded();await page.locator('[data-case="gcc"]').click();assert.ok(await page.locator('#case-dialog').isVisible());await page.keyboard.press('Escape');result.offlineAfterLoad=true;await page.context().setOffline(false);
 const blocked=await browser.newContext({viewport:{width:390,height:844}});await blocked.route('**/*.woff2',r=>r.abort());await blocked.route('**/*.jpeg',r=>r.abort());const p=await blocked.newPage();await p.goto('http://127.0.0.1:8777/',{waitUntil:'networkidle'});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('[data-case="ai"]').scrollIntoViewIfNeeded();await p.locator('[data-case="ai"]').click();assert.ok(await p.locator('#case-dialog').isVisible());result.blockedFontAndImage=true;await blocked.close();
 console.log(JSON.stringify(result,null,2));await writeFile(new URL('../qa/supplement.json',import.meta.url),JSON.stringify(result,null,2));
}finally{await browser.close();}
