import { existsSync, lstatSync, mkdirSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const bunDir = join(root, 'node_modules/.bun');

if (!existsSync(bunDir)) {
  process.exit(0);
}

const entries = readdirSync(bunDir);
const reactStore = entries.find((name) => name.startsWith('react@19.'));
const reactDomStore = entries.find((name) => name.startsWith('react-dom@19.'));

if (!reactStore || !reactDomStore) {
  process.exit(0);
}

function linkPackage(dest, storeName, subpath) {
  const target = join(bunDir, storeName, 'node_modules', subpath);
  mkdirSync(dirname(dest), { recursive: true });

  if (existsSync(dest)) {
    const stat = lstatSync(dest);
    if (stat.isSymbolicLink()) {
      return;
    }
    rmSync(dest, { recursive: true, force: true });
  }

  symlinkSync(relative(dirname(dest), target), dest);
}

linkPackage(join(root, 'node_modules/react'), reactStore, 'react');
linkPackage(join(root, 'node_modules/react-dom'), reactDomStore, 'react-dom');
linkPackage(join(root, 'packages/backoffice/node_modules/react'), reactStore, 'react');
linkPackage(join(root, 'packages/backoffice/node_modules/react-dom'), reactDomStore, 'react-dom');
