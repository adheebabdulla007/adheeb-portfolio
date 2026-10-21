import {chromium,firefox,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.env.QA_URL||'http://127.0.0.1:8777/';
const expected=await readFile(new URL('../assets/AdheebResume.pdf',import.meta.url));
for(const [engine,type] of Object.entries({chromium,firefox,webkit})){
 const browser=await type.launch();
 try {for(const width of [320,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.goto(base);
  for(const link of await page.locator('a[href="assets/AdheebResume.pdf"]').all()){
   const event=page.waitForEvent('download');await link.click();const download=await event;
   assert.equal(await download.failure(),null);
   assert.equal(download.suggestedFilename(),'AdheebAbdullaResume.pdf');
   assert.ok((await readFile(await download.path())).equals(expected));
  }
  await page.locator('#contact-name').fill('Recruiter & Company');
  await page.locator('#contact-email').fill('recruiter@example.com');
  const message='Role: Engineer + integration\nLocation: UAE & India\nDetails: #123, 100%';
  await page.locator('#contact-message').fill(message);
  await page.locator('.contact-form button[type=submit]').click();
  assert.ok(await page.locator('.email-draft').isVisible());
  const gmail=new URL(await page.locator('.draft-gmail').getAttribute('href'));
  const mailto=new URL(await page.locator('.draft-mailto').getAttribute('href'));
  assert.equal(gmail.searchParams.get('to'),'adheebabdullavp@gmail.com');
  assert.equal(mailto.pathname,'adheebabdullavp@gmail.com');
  assert.equal(gmail.searchParams.get('su'),mailto.searchParams.get('subject'));
  assert.equal(gmail.searchParams.get('body'),message+'\n\nFrom: Recruiter & Company\nReply to: recruiter@example.com');
  assert.equal(gmail.searchParams.get('body'),mailto.searchParams.get('body'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#contact-message').fill('Revised message');
  assert.equal(await page.locator('.email-draft').isVisible(),false);
  await page.locator('#contact-name').fill('   ');
  await page.locator('.contact-form button[type=submit]').click();
  assert.equal(await page.locator('.email-draft').isVisible(),false);
  console.log(engine,width,'three actual PDF downloads, draft encoding, recipient, validation and layout PASS');
  await page.close();
 }}finally{await browser.close();}
}
