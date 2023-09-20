import { transform } from '@svgr/core';
import { mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';
import ora from 'ora';
import pMap from 'p-map';
import { join, parse } from 'path';
import prettier from 'prettier';

const OUT_DIR = join(process.cwd(), '/src');
const IN_DIR = join(process.cwd(), '/svgs');

function getComponentName(svgFileName: string) {
  return parse(svgFileName).name.replace(/(?:^|-|_)(.)/g, ($1) =>
    $1.toUpperCase().replace(/-|_/, '')
  );
}

async function buildIcon(svgFileName: string) {
  const svgCode = await readFile(join(IN_DIR, svgFileName), {
    encoding: 'utf-8',
  });

  const componentName = getComponentName(svgFileName);

  const component = await transform(
    svgCode,
    {
      jsxRuntime: 'automatic',
      icon: true,
      typescript: true,
      plugins: [
        '@svgr/plugin-svgo',
        '@svgr/plugin-jsx',
        '@svgr/plugin-prettier',
      ],
      prettier: true,
      replaceAttrValues: {
        '#080525': 'currentColor',
        '#1C1B1F': 'currentColor',
        '#D9D9D9': 'currentColor',
      },
    },
    { componentName }
  );

  await writeFile(join(OUT_DIR, `${componentName}.tsx`), component);
}

async function buildIndex(svgFileNames: string[]) {
  const indexFileContent = svgFileNames
    .map(getComponentName)
    .sort()
    .map(
      (componentName) =>
        `export { default as ${componentName} } from './${componentName}';`
    )
    .join('\n');

  const options = await prettier.resolveConfig(OUT_DIR);
  await writeFile(
    join(OUT_DIR, 'index.ts'),
    prettier.format(indexFileContent, {
      parser: 'typescript',
      ...(options ?? {}),
    })
  );
}

async function generateIcons() {
  const spinner = ora('Start generating icons...').start();

  try {
    const svgFileNames = (await readdir(IN_DIR)).filter((fileName) =>
      fileName.endsWith('.svg')
    );

    await pMap(svgFileNames, async (svgFileName) => buildIcon(svgFileName), {
      concurrency: 20,
    });

    await buildIndex(svgFileNames);

    spinner.succeed(`${svgFileNames.length} icons succesfully generated`);
  } catch (error) {
    spinner.fail('Fail to generate icons');
    throw error;
  }
}

async function main() {
  try {
    await rm(OUT_DIR, { recursive: true, force: true });
    await mkdir(OUT_DIR);

    await generateIcons();
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

void main();
