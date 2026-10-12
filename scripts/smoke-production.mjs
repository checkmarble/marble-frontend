import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = {
  version: 'smoke-test',
  outdated: { outdated: false },
  status: { migrations: false, has_org: true, has_user: true },
  urls: { marble: 'http://localhost', metabase: '', blobs: [] },
  auth: {
    provider: 'firebase',
    firebase: {
      is_emulator: true,
      emulator_host: 'localhost:9099',
      project_id: 'smoke-test',
      api_key: 'smoke-test',
      auth_domain: 'localhost',
    },
  },
  features: { sso: false, segment: false, webhook_secret_rotation: false },
  is_managed_marble: false,
};

// Exercise real SSR and server functions without depending on a deployed backend.
const api = createServer((req, res) => {
  if (req.url === '/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config));
  } else {
    res.writeHead(404);
    res.end();
  }
});
api.listen(0, '127.0.0.1');
await once(api, 'listening');
const apiUrl = `http://127.0.0.1:${api.address().port}`;

async function smoke(workspace) {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = String(reservation.address().port);
  await new Promise((resolve, reject) => reservation.close((error) => (error ? reject(error) : resolve())));
  const server = spawn(process.env.SMOKE_RUNTIME || process.execPath, ['.output/server/index.mjs'], {
    cwd: `${root}packages/${workspace}`,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      ENV: 'development',
      HOST: '127.0.0.1',
      PORT: port,
      NITRO_HOST: '127.0.0.1',
      NITRO_PORT: port,
      SESSION_SECRET: 'production-smoke-test-secret-at-least-32-characters',
      SESSION_MAX_AGE: '43200',
      MARBLE_API_URL: apiUrl,
      API_BASE_URL: apiUrl,
      DISABLE_SEGMENT: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = once(server, 'exit');
  let output = '';
  server.stdout.on('data', (chunk) => (output += chunk));
  server.stderr.on('data', (chunk) => (output += chunk));
  try {
    const deadline = Date.now() + 30_000;
    let url;
    while (!url && Date.now() < deadline) {
      url = output.match(/Listening on (http:\/\/[^\s]+)/)?.[1];
      if (server.exitCode !== null) throw new Error(`${workspace} exited before listening:\n${output}`);
      if (!url) await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.ok(url, `${workspace} did not start:\n${output}`);
    const response = await fetch(`${url}/sign-in`, { signal: AbortSignal.timeout(30_000) });
    const html = await response.text();
    assert.equal(response.status, 200, `${workspace} SSR returned ${response.status}:\n${html}\n${output}`);
    assert.match(html, /<html/);
    assert.match(html, /Sign in/i);
    const stylesheet = html.match(/href="(\/assets\/[^" ]+\.css)"/)?.[1];
    assert.ok(stylesheet, `${workspace} is missing its built stylesheet`);
    const asset = await fetch(`${url}${stylesheet}`, { signal: AbortSignal.timeout(10_000) });
    assert.equal(asset.status, 200, `${workspace} stylesheet is missing`);
    if (workspace === 'app-builder') {
      const locales = await fetch(`${url}/ressources/locales?lng=en-GB&ns=common`, {
        signal: AbortSignal.timeout(10_000),
      });
      assert.equal(locales.status, 200, `Locale server route failed:\n${await locales.clone().text()}\n${output}`);
      assert.ok(Object.keys(await locales.json()).length > 0);
    }
    console.log(`${workspace}: SSR, server functions and static assets passed`);
  } finally {
    server.kill('SIGTERM');
    const killTimer = setTimeout(() => server.kill('SIGKILL'), 5_000);
    await exited;
    clearTimeout(killTimer);
  }
}

try {
  for (const workspace of process.argv.slice(2).length ? process.argv.slice(2) : ['app-builder', 'backoffice']) {
    assert.ok(['app-builder', 'backoffice'].includes(workspace), `Unknown workspace ${workspace}`);
    await smoke(workspace);
  }
} finally {
  await new Promise((resolve, reject) => api.close((error) => (error ? reject(error) : resolve())));
}
