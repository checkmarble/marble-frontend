import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { Stream } from 'node:stream';

import ora from 'ora';
import SVGSpriter from 'svg-sprite';

const OUT_DIR = join(process.cwd(), '/src/generated');
const IN_ICONS_DIR = join(process.cwd(), '/svgs/icons/');
const IN_LOGOS_DIR = join(process.cwd(), '/svgs/logos');

async function buildIconTypeFile(svgFileNames: string[]) {
  const icons = svgFileNames.map((file) => basename(file, '.svg'));

  const output = `
    export const iconNames = [ ${icons.map((icon) => `"${icon}",`).join('')} ] as const;
    export type IconName = typeof iconNames[number];
  `;

  await writeFile(join(OUT_DIR, 'icon-names.ts'), output);
}

async function buildIconSvgSprite(svgFileNames: string[]) {
  const spriter = new SVGSpriter({
    dest: OUT_DIR,
    mode: {
      symbol: true,
    },
    shape: {
      transform: [
        {
          svgo: {
            //@ts-expect-error svg-sprite types are not up to date
            plugins: [
              {
                name: 'convertColors',
                params: {
                  currentColor: true,
                },
              },
            ],
          },
        },
      ],
    },
  });

  for (const svgFileName of svgFileNames) {
    const svgPath = join(IN_ICONS_DIR, svgFileName);
    const svgCode = await readFile(svgPath, {
      encoding: 'utf-8',
    });

    spriter.add(svgPath, null, svgCode);
  }

  const { result } = (await spriter.compileAsync()) as {
    result: { symbol: { sprite: { contents: Stream } } };
  };
  const contents = result.symbol.sprite.contents;

  await writeFile(join(OUT_DIR, 'icons-svg-sprite.svg'), contents);
}

async function buildLogoTypeFile(svgFileNames: string[]) {
  const logos = svgFileNames.map((file) => basename(file, '.svg'));
  const output = `
    export const logoNames = [${logos.map((logo) => `"${logo}",`).join('')}] as const;
    export type LogoName = typeof logoNames[number];
  `;

  await writeFile(join(OUT_DIR, 'logo-names.ts'), output);
}

async function buildLogoSvgSprite(svgFileNames: string[]) {
  const spriter = new SVGSpriter({
    dest: OUT_DIR,
    mode: {
      symbol: true,
    },
    shape: {
      transform: [
        {
          svgo: {},
        },
      ],
    },
  });

  for (const svgFileName of svgFileNames) {
    const svgPath = join(IN_LOGOS_DIR, svgFileName);
    const svgCode = await readFile(svgPath, {
      encoding: 'utf-8',
    });

    spriter.add(svgPath, null, svgCode);
  }

  const { result } = (await spriter.compileAsync()) as {
    result: { symbol: { sprite: { contents: Stream } } };
  };
  const contents = result.symbol.sprite.contents;

  await writeFile(join(OUT_DIR, 'logos-svg-sprite.svg'), contents);
}

async function generateIcons() {
  const spinner = ora('Start generating svg sprites...').start();

  try {
    const iconsSVGFileNames = (await readdir(IN_ICONS_DIR)).filter((fileName) =>
      fileName.endsWith('.svg'),
    );
    await Promise.all([
      buildIconSvgSprite(iconsSVGFileNames),
      buildIconTypeFile(iconsSVGFileNames),
    ]);

    spinner.succeed(`${iconsSVGFileNames.length} icons succesfully generated`);

    const logosSVGFileNames = (await readdir(IN_LOGOS_DIR)).filter((fileName) =>
      fileName.endsWith('.svg'),
    );
    await Promise.all([
      buildLogoSvgSprite(logosSVGFileNames),
      buildLogoTypeFile(logosSVGFileNames),
    ]);
    spinner.succeed(`${logosSVGFileNames.length} logos succesfully generated`);

    spinner.succeed('svg sprites succesfully generated');
  } catch (error) {
    spinner.fail('Fail to generate svg sprites');
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
