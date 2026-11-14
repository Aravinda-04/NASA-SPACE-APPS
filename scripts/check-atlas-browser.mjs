import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

/** End-to-end atlas verification. The supplied page only provides a browser;
 * every scenario runs in its own context, without touching a user's saved work. */
export async function verifyAtlasJourney(runnerPage, { baseURL, outputDirectory }) {
  await mkdir(outputDirectory, { recursive: true });
  const browser = runnerPage.context().browser();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const storageKey = 'offworld-expedition:v2';
  const seed = {
    version: 2,
    progress: {
      surveyor: { discovered: ['lander'], completed: false },
      curiosity: { discovered: ['landing', 'wheels', 'instruments', 'sample'], completed: true },
      pioneer: { discovered: [], completed: false },
    },
    readingLocations: { surveyor: 3, curiosity: 1, pioneer: 2 },
    collection: { 'curiosity-skycrane': { earnedAt: '2026-11-14T00:00:00Z', firstViewedAt: null, origin: 'mission-completion' } },
    optionalAttempts: { pioneer: { answer: 2, attempts: 3, correct: true } },
  };
  const results = [];
  const readSave = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  const waitFocused = async (id) => page.waitForFunction(expected => {
    const atlas = document.querySelector('.interactive-planet-atlas');
    const canvas = atlas?.querySelector('canvas');
    return atlas?.dataset.motionState === 'focused' && canvas?.dataset.focusedRecord === expected;
  }, id);
  const camera = () => page.locator('.planet-atlas-viewport canvas').evaluate(element => ({
    position: element.dataset.cameraPosition?.split(',').map(Number),
    target: element.dataset.cameraTarget?.split(',').map(Number),
  }));
  const radius = data => Math.hypot(...data.position.map((value, i) => value - data.target[i]));
  const open = async (volume) => {
    if (await page.getByRole('button', { name: 'View all volumes', exact: true }).count()) await page.getByRole('button', { name: 'View all volumes', exact: true }).click();
    await page.getByRole('button', { name: `Select ${volume}`, exact: true }).click();
    await page.getByRole('button', { name: `Open ${volume}`, exact: true }).click();
    await page.locator('.planetary-journal').waitFor();
  };
  const assertLayout = async () => {
    const problems = await page.evaluate(() => {
      const issues = [], visible = element => element.getBoundingClientRect().width > 0;
      for (const element of document.querySelectorAll('.archive-page,.contents-record,.planet-atlas-controls,.atlas-mission-summary'))
        if (visible(element) && element.scrollWidth > element.clientWidth + 2) issues.push(element.className);
      if (document.documentElement.scrollWidth > innerWidth + 2) issues.push('document overflow');
      const rows = [...document.querySelectorAll('.contents-record')].filter(visible);
      const svg = document.querySelector('.contents-trajectory');
      if (rows.length) {
        const bounds = svg.getBoundingClientRect();
        rows.forEach((row,i) => {
          const badge = row.querySelector('.contents-compass').getBoundingClientRect();
          if (Math.abs(badge.y + badge.height / 2 - (bounds.y + (i + .5) / rows.length * bounds.height)) > 1) issues.push(`node ${i} vertical alignment`);
          if (Math.abs(badge.x + badge.width / 2 - (bounds.x + (i % 2 ? 92 : 44) / 520 * bounds.width)) > 1) issues.push(`node ${i} horizontal alignment`);
          if (i && rows[i-1].getBoundingClientRect().bottom > row.getBoundingClientRect().top + 1) issues.push('row overlap');
        });
      }
      if (innerWidth > 800) {
        const atlas = document.querySelector('.planet-atlas-page').getBoundingClientRect();
        const index = document.querySelector('.archive-index').getBoundingClientRect();
        if (atlas.x >= index.x || atlas.right > index.x + 1) issues.push('atlas must be on the left');
      }
      return issues;
    });
    assert.deepEqual(problems, [], 'Responsive book geometry');
  };
  try {
    await page.goto(baseURL);
    await page.evaluate(({key,seed}) => localStorage.setItem(key, JSON.stringify(seed)), {key:storageKey, seed});
    await page.reload();
    assert.equal(await page.locator('canvas').count(),0,'The library never runs a background 3D scene');
    assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').some(entry=>/InteractivePlanetAtlas|ExplorationExperience/.test(entry.name))),false,'Heavy scenes are lazy-loaded');
    assert.equal(await page.getByRole('button', { name: /^Select / }).count(), 3);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByRole('button', { name: 'Select Moon', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.cinematic-library')?.dataset.phase === 'focused');
    const centring = await page.locator('.library-option.is-selected').evaluate(element => {
      const b = element.getBoundingClientRect(); return Math.abs(b.x + b.width / 2 - innerWidth / 2);
    });
    assert.ok(centring < 2, 'Selected book is horizontally centred');
    assert.equal(await page.locator('.library-option:not(.is-selected)').first().evaluate(e => Number(getComputedStyle(e).opacity) < .2), true);
    assert.match(await page.locator('.library-environment-image').evaluate(e => getComputedStyle(e).filter), /blur/);
    await page.screenshot({ path:path.join(outputDirectory,'library-moon-focused.png'),fullPage:true,animations:'disabled' });
    await page.getByRole('button', { name: 'Select Moon', exact:true }).focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('.cinematic-library')?.dataset.phase === 'focused');
    assert.equal(await page.locator('.library-option.is-selected').getAttribute('data-book'), 'curiosity');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.cinematic-library').getAttribute('data-phase'), 'browsing');
    await page.getByRole('button', { name: 'Select Moon', exact:true }).click();
    await page.getByRole('button', { name: 'Open Moon', exact:true }).click();
    assert.equal(await page.locator('.cinematic-library').getAttribute('data-phase'), 'opening');
    await page.locator('.planetary-journal').waitFor();
    await waitFocused('surveyor-3');
    await page.emulateMedia({ reducedMotion:'reduce' });
    results.push('Centred selection, themed background, keyboard volume switching, Escape and physical opening');

    for (const [volume,id,count,playableIndex,firstId] of [
      ['Moon','surveyor',4,0,'surveyor-3'], ['Mars','curiosity',5,2,'viking-1'], ['Outer Space','pioneer',4,0,'pioneer-10'],
    ]) {
      if (id !== 'surveyor') await open(volume);
      await waitFocused(firstId);
      assert.equal((await readSave()).readingLocations[id], seed.readingLocations[id]);
      assert.equal(await page.locator('.contents-record').count(), count);
      for (let i=0;i<count;i++) {
        const row = page.locator('.contents-record').nth(i);
        const recordId = (await row.getAttribute('id')).replace('contents-','');
        const title = await row.locator('strong').innerText();
        await row.click();
        await waitFocused(recordId);
        assert.equal(await page.locator('#selected-mission-title').innerText(),title);
        assert.equal(await row.getAttribute('aria-pressed'),'true');
        assert.equal(await page.locator('#artifact-launch').count(),i===playableIndex?1:0);
        await assertLayout();
        await page.getByRole('button',{name:'Open artifact dossier',exact:true}).click();
        assert.equal(await page.getByRole('dialog').count(),1);
        assert.equal(await page.locator('#artifact-heading').innerText(),title);
        assert.equal(await page.locator('.artifact-field-notes > section').count(),5);
        assert.equal(await page.locator('.interactive-planet-atlas').getAttribute('data-paused'),'true');
        assert.equal(await page.locator('#dossier-launch').count(),i===playableIndex?1:0);
        for (const link of await page.locator('.artifact-sources a').all()) {
          assert.match(await link.getAttribute('href'),/^https:\/\/.+nasa\.gov\//);
          assert.equal(await link.getAttribute('target'),'_blank');
          assert.match(await link.getAttribute('rel'),/noopener/);
        }
        await page.getByRole('button',{name:'Close artifact dossier',exact:true}).click();
        await page.waitForFunction(()=>document.activeElement.id==='artifact-open-dossier');
      }
      assert.equal(Number(await page.locator('.contents-active-path').getAttribute('stroke-dashoffset')),0);
      await page.locator('.contents-record').nth(playableIndex).click();
      await waitFocused(id==='surveyor'?'surveyor-3':id==='curiosity'?'curiosity-rover':'pioneer-10');
      const initialCamera=await camera();
      if (id==='curiosity') {
        const [x,y,z]=initialCamera.position; const r=Math.hypot(x,y,z);
        assert.ok(Math.abs(Math.asin(y/r)*180/Math.PI + 4.5895)<.0001,'Gale latitude faces the camera');
        assert.ok(Math.abs(Math.atan2(-z,x)*180/Math.PI - 137.4417)<.0001,'Gale east longitude faces the camera');
      }
      if (id==='pioneer') {
        assert.deepEqual(initialCamera.target,[0,0,0],'Mission focus retains the Sun and destination orbit in one AU reference frame');
        assert.match(await page.locator('.solar-reference-date').innerText(),/30 Oct 2018.*00:00 TDB/);
        assert.match(await page.locator('.atlas-provenance').innerText(),/uniform AU scale.*symbols are enlarged.*not mission trajectories or live positions/);
        await page.getByRole('button',{name:'All 8 planets',exact:true}).click();
        await page.waitForFunction(()=>document.querySelector('.interactive-planet-atlas').dataset.motionState==='idle');
        assert.ok(radius(await camera())>100,'Overview accommodates Neptune at its real distance');
        await page.locator('.solar-distance-key summary').click();
        assert.equal(await page.locator('.solar-distance-key dt').count(),8);
        await assertSolarLabels(page);
        await page.screenshot({path:path.join(outputDirectory,'solar-full-system.png'),fullPage:true,animations:'disabled'});
        await page.getByRole('button',{name:'Inner system',exact:true}).click();
        await page.waitForFunction(()=> {
          const canvas=document.querySelector('.planet-atlas-viewport canvas');
          return Math.hypot(...(canvas?.dataset.cameraPosition?.split(',').map(Number)??[100]))<10 && document.querySelector('.interactive-planet-atlas').dataset.motionState==='idle';
        });
        assert.ok(radius(await camera())<10,'Inner view magnifies the same AU model');
        await assertSolarLabels(page);
        await page.screenshot({path:path.join(outputDirectory,'solar-inner-system.png'),fullPage:true,animations:'disabled'});
        await page.locator('.solar-distance-key summary').click();
        await page.getByRole('button',{name:'Focus mission',exact:true}).click();
        await waitFocused('pioneer-10');
      }
      await page.getByRole('button',{name:'Zoom atlas in',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('.interactive-planet-atlas').dataset.motionState==='idle');
      assert.ok(radius(await camera())<radius(initialCamera),'Zoom controls move the camera');
      await page.getByRole('button',{name:'Focus mission',exact:true}).click();
      await waitFocused(id==='surveyor'?'surveyor-3':id==='curiosity'?'curiosity-rover':'pioneer-10');
      await page.getByRole('button',{name:'Toggle atlas labels',exact:true}).click();
      assert.equal(await page.getByRole('button',{name:'Toggle atlas labels',exact:true}).getAttribute('aria-pressed'),'false');
      await page.getByRole('button',{name:'Toggle atlas labels',exact:true}).click();
      await page.getByRole('button',{name:'Open Space Backpack',exact:true}).click();
      assert.equal(await page.locator('.interactive-planet-atlas').getAttribute('data-paused'),'true');
      await page.getByRole('button',{name:'Close Space Backpack or reward',exact:true}).click();
      await page.screenshot({path:path.join(outputDirectory,`journal-${id}-desktop.png`),fullPage:true,animations:'disabled'});
      await page.locator('#artifact-launch').click();
      await page.locator(`.exp-${id}`).waitFor({timeout:30000});
      await page.getByRole('button',{name:'Back to journal',exact:true}).click();
      assert.equal(await page.locator('.contents-record').nth(playableIndex).getAttribute('aria-pressed'),'true');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'artifact-launch');
      await page.reload(); await open(volume);
      assert.equal(await page.locator('.contents-record').nth(playableIndex).getAttribute('aria-pressed'),'true');
      for (const section of ['Introduction','Mission story','Scientific investigation','Field briefing']) {
        await page.getByRole('navigation',{name:'Book sections'}).getByRole('button',{name:section,exact:true}).click();
        assert.ok(await page.locator('.reader-introduction,.reader-spread,.light-time').count(),`${volume}: ${section}`);
      }
      await page.getByRole('button',{name:'Expedition Library',exact:true}).click();
      results.push(`${volume}: ${count} synchronized records/dossiers, controls, citations, Backpack pause, mission return, reload and original science pages`);
    }
    await open('Mars');
    await waitFocused('curiosity-rover');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.locator('#contents-curiosity-rover').click();
    await page.waitForFunction(()=>document.querySelector('.interactive-planet-atlas').dataset.motionState==='focusing');
    const box=await page.locator('.planet-atlas-viewport canvas').boundingBox();
    const beforeDrag=await camera();
    await page.mouse.move(box.x+box.width*.38,box.y+box.height*.5);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width*.67,box.y+box.height*.57,{steps:8});
    assert.equal(await page.locator('.interactive-planet-atlas').getAttribute('data-motion-state'),'user-rotating');
    await page.mouse.up();
    const afterDrag=await camera();
    assert.ok(Math.hypot(...afterDrag.position.map((value,i)=>value-beforeDrag.position[i]))>.01,'Dragging changes the real camera position');
    assert.equal(await page.locator('.interactive-planet-atlas').getAttribute('data-selected-record'),'curiosity-rover');
    await page.getByRole('button',{name:'Focus mission',exact:true}).click();
    await waitFocused('curiosity-rover');
    const beforeWheel=radius(await camera());
    await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);
    await page.mouse.wheel(0,-160);
    await page.waitForFunction(before=>{
      const canvas=document.querySelector('.planet-atlas-viewport canvas');
      const p=canvas.dataset.cameraPosition?.split(',').map(Number),t=canvas.dataset.cameraTarget?.split(',').map(Number);
      return p&&t&&Math.hypot(...p.map((value,i)=>value-t[i]))<before;
    },beforeWheel);
    await page.emulateMedia({reducedMotion:'reduce'});
    results.push('Real canvas dragging interrupts focus, preserves selection and permits smooth refocus');
    for (const width of [1024,768,390,320]) {
      await page.setViewportSize({width,height:900});
      await page.getByRole('button',{name:'Contents',exact:true}).click();
      await assertLayout();
      if (width<=800) assert.equal(await page.locator('.planet-atlas-viewport canvas').count(),0,'Hidden mobile atlas releases its renderer');
      await page.locator('#contents-ingenuity').click();
      await waitFocused('ingenuity');
      await assertLayout();
      if (width<=800) {
        assert.equal(await page.locator('.archive-index').isVisible(),false);
        assert.equal(await page.evaluate(()=>document.activeElement.id),'atlas-page-heading');
        const backPosition=await page.getByRole('button',{name:'Back to timeline',exact:true}).boundingBox();
        assert.ok(backPosition.y>=0&&backPosition.y<900,'Mobile Back navigation is visible after opening the atlas');
        await page.screenshot({path:path.join(outputDirectory,`journal-${width}-atlas.png`),fullPage:true,animations:'disabled'});
        if(width===390) {
          await page.getByRole('button',{name:'Open artifact dossier',exact:true}).click();
          const detail=await page.getByRole('dialog').boundingBox();
          assert.ok(detail.x>=0&&detail.x+detail.width<=width,'Mobile dossier fits the viewport');
          await page.getByRole('button',{name:'Close artifact dossier',exact:true}).click();
          await page.waitForFunction(()=>document.activeElement.id==='artifact-open-dossier');
          const restored=await page.locator('#artifact-open-dossier').boundingBox();
          assert.ok(restored.y>=0&&restored.y<900,'Dossier return restores visible trigger focus');
        }
        await page.getByRole('button',{name:'Back to timeline',exact:true}).click();
        assert.equal(await page.evaluate(()=>document.activeElement.id),'contents-ingenuity');
        assert.equal(await page.locator('#contents-ingenuity').getAttribute('aria-pressed'),'true');
      }
      await page.screenshot({path:path.join(outputDirectory,`journal-${width}-timeline.png`),fullPage:true,animations:'disabled'});
    }
    const final=await readSave();
    assert.deepEqual(final.progress,seed.progress); assert.deepEqual(final.collection,seed.collection); assert.deepEqual(final.optionalAttempts,seed.optionalAttempts);
    assert.equal(await page.locator('.contents-active-path').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
    assert.deepEqual(errors,[],'No unexpected console or runtime errors');
    results.push('1440/1024/768/390/320px, mobile focus/back, reduced motion and exact reward/progress preservation');
    await page.getByRole('button',{name:'Expedition Library',exact:true}).click();
    await open('Outer Space');
    await page.locator('#contents-pioneer-10').click();
    await waitFocused('pioneer-10');
    for (const width of [390,320]) {
      await page.setViewportSize({width,height:900});
      await page.getByRole('button',{name:'All 8 planets',exact:true}).click();
      await page.waitForFunction(()=> {
        const canvas=document.querySelector('.planet-atlas-viewport canvas');
        return Math.hypot(...(canvas?.dataset.cameraPosition?.split(',').map(Number)??[0]))>100 && document.querySelector('.interactive-planet-atlas').dataset.motionState==='idle';
      });
      await assertLayout();
      await assertSolarLabels(page);
      await page.locator('.planet-atlas-viewport').screenshot({path:path.join(outputDirectory,`solar-full-${width}.png`),animations:'disabled'});
      await page.getByRole('button',{name:'Inner system',exact:true}).click();
      await page.waitForFunction(()=> {
        const canvas=document.querySelector('.planet-atlas-viewport canvas');
        return Math.hypot(...(canvas?.dataset.cameraPosition?.split(',').map(Number)??[100]))<20 && document.querySelector('.interactive-planet-atlas').dataset.motionState==='idle';
      });
      await assertLayout();
      await assertSolarLabels(page);
      await page.locator('.planet-atlas-viewport').screenshot({path:path.join(outputDirectory,`solar-inner-${width}.png`),animations:'disabled'});
    }
    assert.deepEqual(errors,[],'Solar views have no console or runtime errors');
    results.push('Solar System: dated JPL reference, eight-planet distance key, true-scale full/inner views and collision-free labels at desktop/390/320px');
  } finally { await context.close(); }

  const fallbackContext=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  try {
    await fallbackContext.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'||type==='webgl'?null:original.call(this,type,...args);};
    });
    const fallback=await fallbackContext.newPage(); await fallback.goto(baseURL);
    await fallback.getByRole('button',{name:'Select Mars',exact:true}).click(); await fallback.getByRole('button',{name:'Open Mars',exact:true}).click();
    await fallback.locator('.atlas-unavailable').waitFor();
    await fallback.locator('#contents-curiosity-rover').click();
    assert.equal(await fallback.locator('#selected-mission-title').innerText(),'Curiosity & the sky crane');
    await fallback.getByRole('button',{name:'Open artifact dossier',exact:true}).click();
    assert.equal(await fallback.locator('.artifact-field-notes > section').count(),5);
    results.push('WebGL unavailable: useful location fallback, synchronized selection, full dossier and playable navigation remain accessible');
  } finally {await fallbackContext.close();}
  return {passed:results,consoleErrors:errors};
}

async function assertSolarLabels(page) {
  const issues = await page.locator('.planet-atlas-viewport').evaluate(viewport => {
    const bounds = viewport.getBoundingClientRect();
    const labels = [...viewport.querySelectorAll('.solar-body-label')].filter(label => getComputedStyle(label).visibility === 'visible');
    const boxes = labels.map(label => ({ name:label.textContent, rect:label.getBoundingClientRect() }));
    const failures = [];
    for (const {name,rect} of boxes) if (rect.left < bounds.left || rect.right > bounds.right || rect.top < bounds.top+35 || rect.bottom > bounds.bottom-35) failures.push(`${name}: clipped label`);
    boxes.forEach((box,i) => boxes.slice(i+1).forEach(other => {
      const a=box.rect,b=other.rect;
      if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) failures.push(`${box.name}/${other.name}: overlap`);
    }));
    return {failures,visible:labels.length};
  });
  assert.deepEqual(issues.failures,[]);
  assert.ok(issues.visible>=4,'Visible planets have legible labels');
}
