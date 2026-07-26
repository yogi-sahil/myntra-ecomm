import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(rootDir, 'backend');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const backendPort = process.env.DEV_BACKEND_PORT || '8999';
const backendUrl = `http://127.0.0.1:${backendPort}`;
const children = new Set();
let shuttingDown = false;

const startChild = (args, options = {}) => {
  const child = spawn(npmCommand, args, {
    stdio: 'inherit',
    ...options,
  });
  children.add(child);
  child.once('exit', () => children.delete(child));
  return child;
};

const stopAll = (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(exitCode), 100).unref();
};

process.once('SIGINT', () => stopAll(0));
process.once('SIGTERM', () => stopAll(0));

const backendEnv = {
  ...process.env,
  PORT: backendPort,
  // Local convenience only. Production still fails without an explicit secret.
  JWT_SECRET: process.env.JWT_SECRET || randomBytes(48).toString('hex'),
};

if (!process.env.JWT_SECRET) {
  console.warn('Using an ephemeral JWT secret for this local development session.');
}

const backend = startChild(['run', 'dev'], {
  cwd: backendDir,
  env: backendEnv,
});

backend.once('exit', (code, signal) => {
  if (shuttingDown) return;
  console.error(`Backend stopped before the frontend (${signal || `exit ${code}`}).`);
  stopAll(code || 1);
});

const waitForBackend = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (backend.exitCode !== null) {
      throw new Error('Backend failed to start. Check the error above.');
    }

    try {
      const response = await fetch(`${backendUrl}/api/health`, {
        signal: AbortSignal.timeout(500),
      });
      if (response.ok) return;
    } catch {
      // The API may still be connecting to the port.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Backend did not become ready at ${backendUrl}.`);
};

try {
  await waitForBackend();
  console.log(`Backend ready at ${backendUrl}. Starting storefront...`);

  const frontendArgs = process.argv.slice(2);
  if (!frontendArgs.includes('--host')) {
    frontendArgs.push('--host', '127.0.0.1');
  }

  const frontend = startChild(['run', 'dev:frontend', '--', ...frontendArgs], {
    cwd: rootDir,
    env: {
      ...process.env,
      VITE_BACKEND_URL: backendUrl,
    },
  });

  frontend.once('exit', (code, signal) => {
    if (shuttingDown) return;
    if (code && code !== 0) {
      console.error(`Frontend stopped unexpectedly (${signal || `exit ${code}`}).`);
    }
    stopAll(code || 0);
  });
} catch (error) {
  console.error(error.message);
  stopAll(1);
}
