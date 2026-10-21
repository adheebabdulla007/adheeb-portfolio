import {chromium, firefox, webkit} from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.QA_URL || 'http://127.0.0.1:8782/';
for (const [engine, type] of Object.entries({chromium, firefox, webkit})) {
  const browser = await type.launch();
  try {
    for (const [width,height] of [[320,900],[767,900],[768,900],[1440,900],[844,390],[1024,600]]) {
      const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
      await page.goto(base);
      const internal = await page.locator('a[href^="#"]').evaluateAll(links =>
        [...new Set(links.map(a => a.getAttribute('href')))]);
      for (const hash of internal) {
        await page.goto(base + hash);
        await page.evaluate(() => document.fonts.ready);
        const box = await page.locator(hash).boundingBox();
        assert.ok(box && box.width > 0 && box.height > 0, `${engine} ${width} ${hash} missing`);
        // A deep link must bring the target into the viewport, including the phone carousel.
        assert.ok(box.x < width && box.x + box.width > 0, `${engine} ${width} ${hash} offscreen horizontally`);
      }
      for (const id of ['gcc','erp','pursuit','research']) {
        await page.locator('[data-filter="research"]').click();
        await page.locator(`.capability-shortcuts [data-project-link="${id}"]`).click();
        assert.equal(new URL(page.url()).hash, '#' + id);
        assert.ok(await page.locator(`#${id}-details`).evaluate(e=>e.open));
        const rect = await page.locator('#' + id).boundingBox();
        assert.ok(rect.x >= -1 && rect.x < width, `${engine} ${width} ${id} shortcut offscreen`);
        assert.ok(rect.y >= 0 && rect.y < 150, `${engine} ${width} ${id} hidden under header`);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1));
        await page.locator(`[data-close-project="${id}-details"]`).click();
      }
      await page.locator('[data-filter="research"]').click();
      await page.getByRole('link',{name:'Back to the GCC project summary',exact:true}).click();
      assert.equal(await page.locator('#gcc').isVisible(),true);
      assert.equal(await page.locator('#gcc-details').evaluate(e=>e.open),true);
      assert.equal(new URL(page.url()).hash,'#gcc');
      const resume = await page.request.get(new URL('assets/AdheebResume.pdf',base).href);
      assert.equal(resume.status(),200);
      assert.equal((await resume.body()).subarray(0,4).toString(),'%PDF');
      const destinations = await page.locator('.contact-social a').evaluateAll(a=>a.map(x=>x.href));
      assert.deepEqual(destinations,[
        'https://www.linkedin.com/in/adheeb-abdullavp/',
        'https://github.com/adheebabdulla007',
        'https://wa.me/919400727023',
        'tel:+919400727023'
      ]);
      console.log(`${engine} ${width}x${height}: all ${internal.length} anchor destinations, four filtered project shortcuts, résumé and contact destinations PASS`);
      await page.close();
    }
  } finally { await browser.close(); }
}
