import { execSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPostgresHealthy(maxAttempts = 30) {
  process.stdout.write('Waiting for PostgreSQL container to be healthy...');
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const containerId = execSync('docker compose ps -q postgres', {
        encoding: 'utf8',
      }).trim();

      if (containerId) {
        const status = execSync(
          `docker inspect --format='{{.State.Health.Status}}' ${containerId}`,
          { encoding: 'utf8' }
        ).trim();

        if (status === 'healthy') {
          console.log(' ready!');
          return;
        }
      }
    } catch {
      // Container not ready yet, keep polling
    }

    process.stdout.write('.');
    await sleep(2000);
  }

  console.error('\nPostgreSQL did not become healthy in time.');
  process.exit(1);
}

async function main() {
  if (!existsSync('.env')) {
    console.log('No .env file found. Creating one from .env.example...');
    copyFileSync('.env.example', '.env');
    console.log(
      'Created .env. Remember to set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to log in.'
    );
  }

  console.log('1/4 Starting PostgreSQL container...');
  run('docker compose up -d postgres');

  await waitForPostgresHealthy();

  console.log('2/4 Running database migrations...');
  run('pnpm db:migrate');

  console.log('3/4 Seeding database...');
  run('pnpm db:seed');

  console.log('4/4 Starting Inngest Dev Server and Next.js...');
  console.log('    - App:     http://localhost:3000/recruitment/signin');
  console.log('    - Inngest: http://localhost:8288');
  console.log(
    '    Note: First-time page compilation in Next.js may take 1-2 minutes.\n'
  );

  const children = [];

  const inngest = spawn(
    'pnpm',
    [
      'dlx',
      'inngest-cli@latest',
      'dev',
      '-u',
      'http://localhost:3000/recruitment/api/inngest',
    ],
    { stdio: 'inherit', shell: process.platform === 'win32' }
  );
  children.push(inngest);

  const nextDev = spawn('pnpm', ['dev'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  children.push(nextDev);

  const shutdown = () => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGINT');
      }
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  nextDev.on('exit', (code) => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGINT');
      }
    }
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error('dev:up failed:', err);
  process.exit(1);
});
