const { chromium } = require('playwright');
require('node:fs').mkdirSync('artifacts', { recursive: true });
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'artifacts/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 393, height: 852 });
  await page.screenshot({ path: 'artifacts/android-preview.png', fullPage: true });
  console.log(
    JSON.stringify({
      errors,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    }),
  );
  await browser.close();
})();
