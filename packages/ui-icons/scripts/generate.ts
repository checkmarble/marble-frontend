import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { Stream } from 'node:stream';

import ora from 'ora';
import SVGSpriter from 'svg-sprite';

type SvgSpriteConfig = ConstructorParameters<typeof SVGSpriter>[0];

type SvgoNamedPlugin = {
  name: string;
  params?: Record<string, unknown>;
};

type SpriteConfig = Omit<SvgSpriteConfig, 'shape'> & {
  shape?: Omit<NonNullable<SvgSpriteConfig['shape']>, 'transform'> & {
    transform?: Array<{ svgo: { plugins?: SvgoNamedPlugin[] } }>;
  };
};

function createSpriter(config: SpriteConfig) {
  // @types/svg-sprite types SVGO plugins as `{ pluginName: boolean }[]`
  return new SVGSpriter(config as SvgSpriteConfig);
}

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
  const spriter = createSpriter({
    dest: OUT_DIR,
    mode: {
      symbol: true,
    },
    shape: {
      transform: [
        {
          svgo: {
            plugins: [{ name: 'convertColors', params: { currentColor: true } }],
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

function readViewBoxSize(svgCode: string, fileName: string) {
  const match = /viewBox="([^"]+)"/.exec(svgCode);
  const parts = match?.[1]
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const width = parts?.[2];
  const height = parts?.[3];

  if (
    parts?.length !== 4 ||
    width === undefined ||
    height === undefined ||
    Number.isNaN(width) ||
    Number.isNaN(height)
  ) {
    throw new Error(`Missing or invalid viewBox in ${fileName}`);
  }

  return { width, height };
}

async function buildLogoTypeFile(svgFileNames: string[]) {
  const logos = await Promise.all(
    svgFileNames.map(async (file) => {
      const svgCode = await readFile(join(IN_LOGOS_DIR, file), 'utf-8');
      return {
        name: basename(file, '.svg'),
        ...readViewBoxSize(svgCode, file),
      };
    }),
  );

  const output = `
    export const logoNames = [${logos.map((logo) => `"${logo.name}",`).join('')}] as const;
    export type LogoName = typeof logoNames[number];

    export const logoViewBoxes = {
      ${logos.map((logo) => `"${logo.name}": { width: ${logo.width}, height: ${logo.height} },`).join('\n')}
    } as const satisfies Record<LogoName, { width: number; height: number }>;
  `;

  await writeFile(join(OUT_DIR, 'logo-names.ts'), output);
}

async function buildLogoSvgSprite(svgFileNames: string[]) {
  const spriter = createSpriter({
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
    const iconsSVGFileNames = (await readdir(IN_ICONS_DIR)).filter((fileName) => fileName.endsWith('.svg'));
    await Promise.all([buildIconSvgSprite(iconsSVGFileNames), buildIconTypeFile(iconsSVGFileNames)]);

    spinner.succeed(`${iconsSVGFileNames.length} icons succesfully generated`);

    const logosSVGFileNames = (await readdir(IN_LOGOS_DIR)).filter((fileName) => fileName.endsWith('.svg'));
    await Promise.all([buildLogoSvgSprite(logosSVGFileNames), buildLogoTypeFile(logosSVGFileNames)]);
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
