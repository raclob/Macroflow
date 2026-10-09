const { spawn } = require('node:child_process');
const { once } = require('node:events');
const port = Number(process.env.E2E_PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('E2E_PORT must be an integer between 1024 and 65535.');
}
const url = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
  ],
  { stdio: 'inherit' },
);
const serverError = once(server, 'error').then(([error]) => {
  throw error;
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function run(script) {
  const child = spawn(process.execPath, [script], {
    stdio: 'inherit',
    env: { ...process.env, APP_URL: url },
  });
  const [code] = await once(child, 'exit');
  if (code !== 0) throw new Error(`${script} failed with exit code ${code}`);
}
async function main() {
  try {
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (server.exitCode !== null)
        throw new Error('The preview server exited before tests started.');
      try {
        const response = await fetch(url);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {}
      await delay(250);
    }
    if (!ready) throw new Error('The preview server did not become ready in 10 seconds.');
    await run('scripts/verify.cjs');
    await run('scripts/barcode-check.cjs');
  } finally {
    server.kill('SIGTERM');
  }
}
Promise.race([main(), serverError]).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
  server.kill('SIGTERM');
});
