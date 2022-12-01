import ora from 'ora';
import { readFile, writeFile, readdir } from 'fs/promises';
import { transform } from '@svgr/core';
import { parse, join } from 'path';
import pMap from 'p-map';
import prettier from 'prettier';
import rimraf from 'rimraf';

const OUT_DIR = join(process.cwd(), '/src/lib');
const IN_DIR = join(process.cwd(), '/src/svgs');

function getComponentName(svgFileName: string) {
  return parse(svgFileName).name.replace(/(?:^|-)(.)/g, ($1) =>
    $1.toUpperCase().replace('-', '')
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
      icon: true,
      typescript: true,
      plugins: [
        '@svgr/plugin-svgo',
        '@svgr/plugin-jsx',
        '@svgr/plugin-prettier',
      ],
      prettier: true,
    },
    { componentName }
  );

  await writeFile(join(OUT_DIR, `${componentName}.tsx`), component);
}

async function buildIndex(svgFileNames: string[]) {
  const indexFileContent = svgFileNames
    .map(getComponentName)
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
    const svgFileNames = await readdir(IN_DIR);

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
    rimraf.sync(`${OUT_DIR}/*`);

    await generateIcons();
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

main();
