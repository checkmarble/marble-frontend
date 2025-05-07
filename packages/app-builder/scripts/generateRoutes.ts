import { join } from 'node:path';

import { routes } from '@app-builder/utils/routes/routes';
import { Biome, Distribution } from '@biomejs/js-api';
import ora from 'ora';

const biome = await Biome.create({
  distribution: Distribution.NODE,
});

const projectKey = biome.openProject(`${process.cwd()}/../..`);

const outTypesFile = join(process.cwd(), '/src/utils/routes/types.ts');
console.log(`${process.cwd()}/../..`);
console.log('outTypesFile', outTypesFile);

type Route = {
  readonly id: string;
  readonly path?: string;
  children?: readonly Route[];
};

function getRoutesPaths(routes: readonly Route[], prefix?: string): string[] {
  return routes.flatMap((route) => {
    const joinedPath =
      typeof prefix === 'string'
        ? typeof route.path === 'string'
          ? `${prefix}/${route.path}`
          : prefix
        : typeof route.path === 'string'
          ? route.path
          : '';

    return Array.from(
      new Set([joinedPath || '/', ...getRoutesPaths(route.children ?? [], joinedPath)]),
    );
  });
}

function getRoutesIds(routes: readonly Route[]): string[] {
  return routes.flatMap((route) => {
    return [route.id, ...getRoutesIds(route.children ?? [])];
  });
}

async function buildTypesFile(routes: readonly Route[]) {
  const spinner = ora('Start to generate route based types...').start();
  try {
    const RoutePath = `export type RoutePath = ${getRoutesPaths(routes)
      .map((routeId) => `'${routeId}'`)
      .join(' | ')};`;

    const RouteID = `export type RouteID = ${getRoutesIds(routes)
      .map((routeId) => `'${routeId}'`)
      .join(' | ')};`;

    biome.formatContent(
      projectKey,
      `
        ${RoutePath}

        ${RouteID}
      `,
      {
        filePath: outTypesFile,
      },
    );

    spinner.succeed('Succesfully generated route based types');
  } catch (error) {
    spinner.fail('Failed to generate route based types');
    throw error;
  }
}

async function main() {
  try {
    await buildTypesFile(routes);
    biome.shutdown();
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

void main();
