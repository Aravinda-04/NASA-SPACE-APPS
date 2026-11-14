import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

/** Browser regression suite without an additional test framework.
 * Pass a Playwright Page from an isolated browser runner:
 *   await verifyBookReader(page, { baseURL: 'http://127.0.0.1:5173', outputDirectory: '/absolute/qa' });
 * The suite creates its own browser context; it never replaces a user's save.
 */
export async function verifyBookReader(runnerPage, { baseURL, outputDirectory }) {
  await mkdir(outputDirectory, { recursive: true });
  const context = await runnerPage.context().browser().newContext({ viewport: { width: 1440, height: 1080 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const key = 'offworld-expedition:v2';
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
  const readSave = () => page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
  const open = async (volume) => {
    await page.getByRole('button', { name: `Select ${volume}`, exact: true }).click();
    await page.getByRole('button', { name: `Open ${volume}`, exact: true }).click();
    await page.locator('.chronological-spread').waitFor();
  };
  const assertNoOverflow = async () => {
    const failures = await page.evaluate(() => {
      const visible = element => element.getBoundingClientRect().width > 0;
      const issues = [];
      for (const element of document.querySelectorAll('.contents-record,.artifact-heading,.artifact-field-notes,.archive-page')) {
        if (visible(element) && element.scrollWidth > element.clientWidth + 2) issues.push(element.className);
      }
      if (document.documentElement.scrollWidth > innerWidth + 2) issues.push('document');
      const buttons = [...document.querySelectorAll('.contents-record')].filter(visible);
      for (let i = 1; i < buttons.length; i++) if (buttons[i-1].getBoundingClientRect().bottom > buttons[i].getBoundingClientRect().top + 1) issues.push('overlapping rows');
      const svg = document.querySelector('.contents-trajectory');
      if (svg && visible(svg)) {
        const bounds = svg.getBoundingClientRect();
        for (const [i, button] of buttons.entries()) {
          const badge = button.querySelector('.contents-compass').getBoundingClientRect();
          const expectedY = bounds.top + (i + .5) / buttons.length * bounds.height;
          const expectedX = bounds.left + (i % 2 === 0 ? 44 : 92) / 520 * bounds.width;
          if (Math.abs(badge.y + badge.height / 2 - expectedY) > 1 || Math.abs(badge.x + badge.width / 2 - expectedX) > 1) issues.push(`node alignment ${i}`);
        }
      }
      return issues;
    });
    assert.deepEqual(failures, [], 'Readable, aligned and non-overlapping responsive book');
  };
  try {
    await page.goto(baseURL);
    // The production key is read from the implementation to avoid assumptions in the runner.
    const storageKey = await page.evaluate(() => Object.keys(localStorage).find(k => k.includes('expedition') && k.includes('v2')));
    assert.equal(storageKey, key, 'Save-key contract');
    await page.evaluate(({ key, seed }) => localStorage.setItem(key, JSON.stringify(seed)), { key, seed });
    await page.reload();
    for (const [volume, id, count, playableIndex] of [
      ['Moon', 'surveyor', 4, 0], ['Mars', 'curiosity', 5, 2], ['Outer Space', 'pioneer', 4, 0],
    ]) {
      await open(volume);
      assert.equal(await page.getByRole('button', { name: 'Contents', exact: true }).getAttribute('aria-current'), 'page');
      assert.equal(await page.locator('.contents-record').count(), count);
      assert.equal((await readSave()).readingLocations[id], seed.readingLocations[id], 'Legacy page index is unchanged when contents opens');
      for (let i = 0; i < count; i++) {
        const row = page.locator('.contents-record').nth(i);
        const title = await row.locator('strong').innerText();
        await row.click();
        assert.equal(await page.locator('#artifact-heading').innerText(), title);
        assert.equal(await row.getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('.artifact-field-notes > section').count(), 5);
        assert.equal(await page.locator('#artifact-launch').count(), i === playableIndex ? 1 : 0);
        assert.ok((await page.locator('.artifact-atlas svg title').textContent()).length > 40);
        assert.ok(await page.locator('.artifact-sources a').count());
        for (const link of await page.locator('.artifact-sources a').all()) {
          assert.match(await link.getAttribute('href'), /^https:\/\/.+nasa\.gov\//);
          assert.equal(await link.getAttribute('target'), '_blank');
          assert.match(await link.getAttribute('rel'), /noopener/);
        }
        await assertNoOverflow();
      }
      assert.ok(Number(await page.locator('.contents-active-path').getAttribute('stroke-dashoffset')) < 1e-6, 'Last selection fills the trajectory');
      await page.getByRole('button', { name: 'View historical sources', exact: true }).click();
      assert.equal(await page.evaluate(() => document.activeElement.matches('.artifact-sources a')), true);
      // Keyboard focus and activation remain real HTML button interactions.
      await page.locator('.contents-record').first().focus();
      await page.keyboard.press('ArrowDown');
      assert.equal(await page.evaluate(() => document.activeElement.id), await page.locator('.contents-record').nth(1).getAttribute('id'));
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('.contents-record').nth(1).getAttribute('aria-pressed'), 'true');
      await page.locator('.contents-record').nth(playableIndex).click();
      await page.locator('#artifact-launch').click();
      await page.locator(`.exp-${id}`).waitFor({ timeout: 30000 });
      await page.getByRole('button', { name: 'Back to journal', exact: true }).click();
      await page.locator('.chronological-spread').waitFor();
      assert.equal(await page.locator('.contents-record').nth(playableIndex).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'artifact-launch', 'Mission return restores the launcher focus');
      // A reload starts in the library; reopening restores the chosen artifact.
      await page.reload();
      await open(volume);
      assert.equal(await page.locator('.contents-record').nth(playableIndex).getAttribute('aria-pressed'), 'true');
      await page.screenshot({ path: path.join(outputDirectory, `contents-${id}-desktop.png`), fullPage: true, animations: 'disabled' });
      // All original reading surfaces remain reachable, including the Pioneer interactive.
      for (const section of ['Introduction', 'Mission story', 'Scientific investigation', 'Field briefing']) {
        await page.getByRole('navigation', { name: 'Book sections' }).getByRole('button', { name: section, exact: true }).click();
        assert.equal(await page.locator('.chronological-spread').count(), 0);
        assert.ok(await page.locator('.reader-introduction,.reader-spread,.light-time').count(), `${volume}: ${section} remains available`);
      }
      await page.getByRole('button', { name: 'Contents', exact: true }).click();
      results.push(`${volume}: all ${count} dossiers, sources, keyboard, original pages, mission launch/return and reload`);
      await page.getByRole('button', { name: 'Expedition Library', exact: true }).click();
    }
    await open('Mars');
    for (const width of [1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.getByRole('button', { name: 'Contents', exact: true }).click();
      await assertNoOverflow();
      const row = page.locator('.contents-record').last();
      await row.click();
      assert.equal(await page.locator('#artifact-heading').innerText(), 'Ingenuity');
      await assertNoOverflow();
      if (width <= 800) {
        assert.equal(await page.locator('.archive-index').isVisible(), false);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'artifact-heading');
        await page.screenshot({ path: path.join(outputDirectory, `contents-mars-${width}-dossier.png`), fullPage: true, animations: 'disabled' });
        await page.getByRole('button', { name: 'Back to contents', exact: true }).click();
        assert.equal(await page.evaluate(() => document.activeElement.id), 'contents-ingenuity');
        assert.equal(await page.locator('#contents-ingenuity').getAttribute('aria-pressed'), 'true');
      }
      await page.screenshot({ path: path.join(outputDirectory, `contents-mars-${width}.png`), fullPage: true, animations: 'disabled' });
    }
    const final = await readSave();
    assert.deepEqual(final.progress, seed.progress);
    assert.deepEqual(final.collection, seed.collection);
    assert.deepEqual(final.optionalAttempts, seed.optionalAttempts);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.contents-active-path').evaluate(e => getComputedStyle(e).transitionDuration), '0s');
    assert.deepEqual(errors, [], 'No browser runtime or console errors');
    results.push('1024 / 768 / 390 / 320px: responsive alignment, mobile dossier/back focus, reduced motion, progress and reward preservation');
    return { passed: results, consoleErrors: errors };
  } finally {
    await context.close();
  }
}
