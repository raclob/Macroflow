const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
fs.mkdirSync('artifacts', { recursive: true });
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  let errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Make it yours' }).click();
  await page.getByRole('textbox', { name: 'What should we call you?' }).fill('Taylor');
  await page.getByRole('button', { name: 'Let’s get started' }).click();
  await page.getByRole('heading', { name: 'A good day starts here, Taylor.' }).waitFor();
  assert.equal(await page.locator('.demo-banner').count(), 0);
  await page.getByRole('button', { name: 'Log food', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search foods' }).fill('Greek');
  await page.getByRole('button', { name: 'Favorite Greek yogurt', exact: true }).click();
  await page.locator('.food-select').first().click();
  await page.getByRole('combobox', { name: 'Meal', exact: true }).selectOption('Lunch');
  await page.getByRole('spinbutton', { name: 'Number of servings' }).fill('1.5');
  await page.getByRole('button', { name: 'Add to lunch', exact: true }).click();
  await page.locator('.mobile-nav').getByRole('button', { name: 'Diary', exact: true }).click();
  assert.match(await page.locator('.diary-summary h2').innerText(), /150/);
  await page.getByRole('button', { name: 'Complete day', exact: true }).click();
  await page.getByRole('button', { name: 'Reopen day', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Add to Breakfast', exact: true }).click();
  await page.getByRole('button', { name: 'Custom', exact: true }).click();
  await page.getByRole('textbox', { name: 'Food name' }).fill('My smoothie');
  await page.getByRole('textbox', { name: 'Serving size' }).fill('1 glass');
  await page.getByRole('spinbutton', { name: 'Calories (kcal)' }).fill('200');
  await page.getByRole('spinbutton', { name: 'Protein (g)' }).fill('20');
  await page.getByRole('spinbutton', { name: 'Carbs (g)' }).fill('25');
  await page.getByRole('spinbutton', { name: 'Fat (g)' }).fill('2');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Add to breakfast', exact: true }).click();
  await page.getByRole('button', { name: 'Complete day', exact: true }).waitFor();
  assert.match(await page.locator('.diary-summary h2').innerText(), /350/);
  await page.getByRole('button', { name: 'Remove My smoothie', exact: true }).click();
  assert.match(await page.locator('.diary-summary h2').innerText(), /150/);
  await page.getByRole('button', { name: 'Add 250 ml', exact: true }).click();
  await page.locator('.mobile-nav').getByRole('button', { name: 'Insights', exact: true }).click();
  await page.getByRole('button', { name: 'Log weight', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Weight (kg)', exact: true }).fill('78.2');
  await page.getByRole('button', { name: 'Save weight', exact: true }).click();
  assert.match(await page.locator('.stat-card').first().innerText(), /78.2/);
  await page.reload({ waitUntil: 'networkidle' });
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('macroflow-data')));
  const day = Object.values(stored.days)[0];
  assert.equal(day.entries.length, 1);
  assert.equal(day.water, 250);
  assert.equal(day.weight, 78.2);
  assert.equal(stored.favorites.includes('yogurt'), true);
  assert.equal(
    stored.foods.some((f) => f.name === 'My smoothie'),
    true,
  );
  await page.getByRole('button', { name: 'Open settings', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup', exact: true }).click();
  await (await download).saveAs('artifacts/test-backup.json');
  const backup = JSON.parse(fs.readFileSync('artifacts/test-backup.json'));
  assert.equal(backup.profile.name, 'Taylor');
  await page.locator('input[type=file]').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}'),
  });
  await page.getByText('This is not a valid MacroFlow backup (maximum 5 MB).').waitFor();
  await page.getByRole('button', { name: 'Explore sample data', exact: true }).click();
  await page.getByRole('button', { name: 'Back to my diary', exact: true }).waitFor();
  await page.locator('.mobile-nav').getByRole('button', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Review my check-in', exact: true }).click();
  await page.getByRole('button', { name: 'Apply suggestion', exact: true }).click();
  await page.getByRole('button', { name: 'Checked in', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Back to my diary', exact: true }).click();
  assert.equal(await page.locator('.demo-banner').count(), 0);
  assert.equal(
    await page.evaluate(() => JSON.parse(localStorage.getItem('macroflow-data')).profile.calories),
    2200,
  );
  await page.getByRole('button', { name: 'Open settings', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles('artifacts/test-backup.json');
  await page.getByText('Your backup has been restored').waitFor();
  assert.equal(await page.locator('[role=dialog]').count(), 0);
  for (const width of [360, 393, 768, 1440]) {
    await page.setViewportSize({ width, height: 852 });
    for (const name of ['Today', 'Food diary', 'Insights', 'My plan']) {
      const nav = width <= 760 ? page.locator('.mobile-nav') : page.locator('.sidebar nav');
      await nav
        .getByRole('button', {
          name:
            name === 'Food diary' && width <= 760
              ? 'Diary'
              : name === 'My plan' && width <= 760
                ? 'Plan'
                : name,
          exact: true,
        })
        .click();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `Overflow: ${width} ${name}`,
      );
    }
  }
  await page.evaluate((data) => {
    localStorage.clear();
    localStorage.setItem('fuel-data', JSON.stringify(data));
    localStorage.setItem('fuel-demo', 'false');
  }, backup);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'A good day starts here, Taylor.' }).waitFor();
  assert.equal(
    await page.evaluate(() => JSON.parse(localStorage.getItem('macroflow-data')).profile.name),
    'Taylor',
  );
  assert.equal(await page.evaluate(() => localStorage.getItem('macroflow-demo')), 'false');
  assert.deepEqual(errors, []);
  console.log(
    'PASS: setup, portion logging, favorites, custom food, removal, completion, water, weight, persistence, backup export/import, demo isolation, adaptive check-in, legacy browser migration, four layouts × four views, no runtime errors.',
  );
  await browser.close();
})();
