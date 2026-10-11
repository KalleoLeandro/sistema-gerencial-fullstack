const { spawnSync } = require('node:child_process');
const path = require('node:path');

// Node 20.18 requires this flag for Storybook's Angular ESM imports.
// Node 20.19+ enables the same support by default.
const [major, minor] = process.versions.node.split('.').map(Number);
const flags = major === 20 && minor < 19 ? ['--experimental-require-module'] : [];
const target = process.argv[2] === 'build' ? 'build-storybook' : 'storybook';
const result = spawnSync(process.execPath, [
  ...flags,
  path.resolve(__dirname, '../node_modules/@angular/cli/bin/ng.js'),
  'run', `front-end:${target}`, ...process.argv.slice(3),
], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
  env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1' },
});

if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
