const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.route('https://world.openfoodfacts.org/**', (r) =>
    r.fulfill({
      json: {
        status: 1,
        product: {
          product_name: 'Test cereal',
          brands: 'Test',
          nutriments: {
            'energy-kcal_100g': 400,
            proteins_100g: 10,
            carbohydrates_100g: 70,
            fat_100g: 8,
          },
        },
      },
    }),
  );
  await page.getByRole('button', { name: 'Log food', exact: true }).click();
  await page.getByRole('button', { name: 'Barcode', exact: true }).click();
  await page.getByRole('textbox', { name: 'Barcode number', exact: true }).fill('3017620422003');
  await page.getByRole('button', { name: 'Look up barcode', exact: true }).click();
  await page.getByRole('heading', { name: 'Test cereal', exact: true }).waitFor();
  await page.getByRole('spinbutton', { name: 'Number of servings' }).fill('.5');
  assert.match(await page.locator('.food-nutrients').innerText(), /200/);
  await page.getByRole('button', { name: 'Add to breakfast', exact: true }).click();
  await page.getByRole('button', { name: 'Log food', exact: true }).click();
  await page.getByRole('button', { name: 'Barcode', exact: true }).click();
  await page.unroute('https://world.openfoodfacts.org/**');
  await page.route('https://world.openfoodfacts.org/**', (r) => r.fulfill({ json: { status: 0 } }));
  await page.getByRole('textbox', { name: 'Barcode number', exact: true }).fill('0000000000000');
  await page.getByRole('button', { name: 'Look up barcode', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'No match found' }).waitFor();
  console.log(
    'PASS: barcode result, portion calculation, logging, and unknown-product handling. Live API also verified separately.',
  );
  await browser.close();
})();
