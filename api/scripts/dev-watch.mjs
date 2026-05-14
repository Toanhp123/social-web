import { spawn } from 'node:child_process';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const debug = process.argv.includes('--debug');
const nestBin = isWindows ? 'nest.cmd' : 'nest';
const tscAliasBin = isWindows ? 'tsc-alias.cmd' : 'tsc-alias';

let appProcess;
let buildProcess;
let aliasRunning = false;
let aliasPending = false;
let shuttingDown = false;

function log(message) {
  console.log(`[dev-watch] ${message}`);
}

function runTscAlias() {
  if (aliasRunning) {
    aliasPending = true;
    return;
  }

  aliasRunning = true;
  aliasPending = false;

  const aliasProcess = spawn(
    tscAliasBin,
    ['-p', 'tsconfig.build.json'],
    {
      stdio: 'inherit',
      shell: isWindows,
    },
  );

  aliasProcess.on('exit', (code) => {
    aliasRunning = false;

    if (code === 0) {
      restartApp();
    } else {
      log(`tsc-alias exited with code ${code ?? 'unknown'}`);
    }

    if (aliasPending && !shuttingDown) {
      runTscAlias();
    }
  });
}

function restartApp() {
  stopApp(() => {
    if (shuttingDown) {
      return;
    }

    const args = debug
      ? ['--inspect=0.0.0.0:9229', 'dist/src/main.js']
      : ['dist/src/main.js'];

    appProcess = spawn('node', args, {
      stdio: 'inherit',
      shell: false,
    });
  });
}

function stopApp(callback) {
  if (!appProcess || appProcess.exitCode !== null || appProcess.signalCode) {
    callback();
    return;
  }

  const processToStop = appProcess;
  appProcess = undefined;

  processToStop.once('exit', callback);

  if (isWindows) {
    spawn('taskkill', ['/pid', String(processToStop.pid), '/T', '/F'], {
      stdio: 'ignore',
    });
    return;
  }

  processToStop.kill('SIGTERM');
}

function handleBuildOutput(chunk, stream) {
  stream.write(chunk);

  if (chunk.toString().includes('Found 0 errors')) {
    runTscAlias();
  }
}

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  log(`received ${signal}, shutting down`);

  stopApp(() => {
    if (buildProcess && buildProcess.exitCode === null) {
      buildProcess.kill(signal);
    }

    process.exit(0);
  });
}

buildProcess = spawn(nestBin, ['build', '--watch'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows,
});

buildProcess.stdout.on('data', (chunk) => {
  handleBuildOutput(chunk, process.stdout);
});

buildProcess.stderr.on('data', (chunk) => {
  handleBuildOutput(chunk, process.stderr);
});

buildProcess.on('exit', (code, signal) => {
  if (!shuttingDown) {
    log(`nest build --watch exited with code ${code ?? 'unknown'}`);
    shutdown(signal ?? 'SIGTERM');
  }
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
