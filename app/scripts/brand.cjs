// Optional icon regeneration: npm install --no-save sharp, then node scripts/brand.cjs
const sharp = require('sharp');
const fs = require('fs');
const svg = (fg = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="432" height="432" viewBox="0 0 432 432">${fg ? '' : '<rect width="432" height="432" rx="92" fill="#2f6048"/>'}<g fill="none" stroke="#f5f7e9" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><path d="M147 279c-31-70 4-114 61-118 32-3 65-14 79-32 28 87 4 143-53 159-31 9-59 4-75-13"/><path d="M142 301c20-58 53-64 101-103"/></g></svg>`;
fs.mkdirSync('artifacts', { recursive: true });
(async () => {
  for (const [density, size] of Object.entries({
    mdpi: 48,
    hdpi: 72,
    xhdpi: 96,
    xxhdpi: 144,
    xxxhdpi: 192,
  })) {
    for (const name of ['ic_launcher', 'ic_launcher_round'])
      await sharp(Buffer.from(svg()))
        .resize(size, size)
        .png()
        .toFile(`android/app/src/main/res/mipmap-${density}/${name}.png`);
    await sharp(Buffer.from(svg(true)))
      .resize(size * 2.25, size * 2.25)
      .png()
      .toFile(`android/app/src/main/res/mipmap-${density}/ic_launcher_foreground.png`);
  }
  await sharp(Buffer.from(svg())).resize(512, 512).png().toFile('artifacts/macroflow-icon.png');
  for (const dir of fs
    .readdirSync('android/app/src/main/res')
    .filter(
      (d) => d.startsWith('drawable') && fs.existsSync(`android/app/src/main/res/${d}/splash.png`),
    )) {
    await sharp({ create: { width: 480, height: 800, channels: 4, background: '#f6f7f2' } })
      .composite([
        {
          input: await sharp(Buffer.from(svg())).resize(100, 100).png().toBuffer(),
          gravity: 'center',
        },
      ])
      .png()
      .toFile(`android/app/src/main/res/${dir}/splash.png`);
  }
})();
