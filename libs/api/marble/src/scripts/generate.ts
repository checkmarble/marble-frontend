import { mkdir, rm, writeFile } from 'fs/promises';
import { generateSource } from 'oazapfts/lib/codegen/index';
import ora from 'ora';

import {
  GENERATED_API,
  GENERATED_FOLDER,
  OPENAPI_OPTIONS,
  OPENAPI_SPEC,
} from './config';

async function openapiGenerator() {
  const spinner = ora('Start to generate OpenAPI client...').start();
  try {
    const code = await generateSource(OPENAPI_SPEC, OPENAPI_OPTIONS);

    await writeFile(GENERATED_API, code);

    spinner.succeed('Succesfully generated OpenAPI client');
  } catch (error) {
    spinner.fail('Failed to generate OpenAPI client');
    throw error;
  }
}

async function main() {
  try {
    await rm(GENERATED_FOLDER, { recursive: true, force: true });
    await mkdir(GENERATED_FOLDER);

    await openapiGenerator();
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

main();
