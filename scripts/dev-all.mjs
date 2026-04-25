import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const processes = [
  spawn('node', ['server/index.js'], {
    stdio: 'inherit',
    shell: false,
  }),
  spawn(npmCommand, ['run', 'dev:vite'], {
    stdio: 'inherit',
    shell: isWindows,
  }),
];

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(code);
}

for (const child of processes) {
  child.on('exit', (code) => {
    if (!shuttingDown && code !== 0 && code !== null) {
      shutdown(code);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
