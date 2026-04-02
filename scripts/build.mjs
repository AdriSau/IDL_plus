import { cp, mkdir, rm } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');
const watchMode = process.argv.includes('--watch');

async function cleanDist() {
  await rm(distDir, { recursive: true, force: true });
}

async function copyPublic() {
  await mkdir(distDir, { recursive: true });
  await cp(publicDir, distDir, { recursive: true, force: true });
}

function runTsc({ watch: shouldWatch }) {
  const tscBin = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  const args = [tscBin, '--project', 'tsconfig.json'];

  if (shouldWatch) {
    args.push('--watch', '--preserveWatchOutput');
  }

  const child = spawn(process.execPath, args, {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  return child;
}

async function buildOnce() {
  await cleanDist();
  const child = runTsc({ watch: false });

  const exitCode = await new Promise((resolve) => {
    child.on('exit', resolve);
  });

  if (exitCode !== 0) {
    process.exit(exitCode ?? 1);
  }

  await copyPublic();
  console.log('[build] dist ready');
}

async function buildWatch() {
  await cleanDist();
  await copyPublic();

  watch(publicDir, { recursive: true }, async () => {
    try {
      await copyPublic();
      console.log('[build] public assets synced');
    } catch (error) {
      console.error('[build] failed to sync public assets', error);
    }
  });

  const child = runTsc({ watch: true });
  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

if (watchMode) {
  await buildWatch();
} else {
  await buildOnce();
}
